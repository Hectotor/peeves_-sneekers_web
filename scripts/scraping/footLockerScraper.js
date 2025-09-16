const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

// Configuration
const BASE_URL = 'https://www.footlocker.fr';
const BASE_TARGET_URL = 'https://www.footlocker.fr/fr/category/homme/chaussures.html?query=:relevance:collection_id:men-shoes:brand:Nike:brand:Jordan';
const OUTPUT_FILE = 'footlocker_products.json';
const MAX_PAGES = 14; // Nombre total de pages à scraper

// Fonction pour extraire les données des produits d'une page spécifique
async function scrapePage(page, pageNumber) {
  const url = pageNumber > 1 
    ? `${BASE_TARGET_URL}&currentPage=${pageNumber}`
    : BASE_TARGET_URL;

  console.log(`Naviguant vers la page ${pageNumber}: ${url}`);
  
  try {
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 60000 
    });
    
    // Attendre que les produits soient chargés
    await page.waitForSelector('.ProductCard', { timeout: 30000 });
    
    // Faire défiler la page pour charger toutes les images
    await autoScroll(page);
    
    // Attendre un peu pour le chargement des images
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Obtenir le contenu HTML de la page
    const html = await page.content();
    const $ = cheerio.load(html);
    
    const products = [];
    
    // Parcourir chaque carte de produit
    $('.ProductCard').each((i, element) => {
      try {
        let imageUrl = $(element).find('.ProductCard-image--primary.Image.Image--Product.Image--square').attr('src');
        
        // Mettre à jour la taille de l'image à 500x500 si elle existe
        if (imageUrl) {
          imageUrl = imageUrl.replace(/wid=\d+&hei=\d+/, 'wid=500&hei=500');
        }
        
        const product = {
          name: {
            primary: $(element).find('.ProductName-primary').text().trim(),
            alt: $(element).find('.ProductName-alt.ProductName-alt-V3').text().trim()
          },
          price: {
            final: $(element).find('.ProductPrice-final, .ProductPrice').text().trim(),
            original: $(element).find('.ProductPrice-original').text().trim()
          },
          image: imageUrl,
          page: pageNumber
        };
        
        // N'ajouter le produit que s'il a au moins un nom ou un prix
        if (product.name.primary || product.price.final) {
          products.push(product);
        }
      } catch (error) {
        console.error('Erreur lors du traitement d\'un produit:', error);
      }
    });
    
    console.log(`Page ${pageNumber}: ${products.length} produits trouvés`);
    return products;
    
  } catch (error) {
    console.error(`Erreur lors du scraping de la page ${pageNumber}:`, error);
    return [];
  }
}

// Fonction pour faire défiler la page
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

// Fonction principale pour le scraping
async function scrapeProducts() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Configurer un user-agent pour éviter d'être bloqué
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Désactiver les images pour accélérer le chargement
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (request.resourceType() === 'image') {
        request.abort();
      } else {
        request.continue();
      }
    });
    
    let allProducts = [];
    
    // Parcourir toutes les pages
    for (let i = 1; i <= MAX_PAGES; i++) {
      const pageProducts = await scrapePage(page, i);
      allProducts = [...allProducts, ...pageProducts];
      
      // Attendre un peu entre les pages pour éviter d'être bloqué
      if (i < MAX_PAGES) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\nScraping terminé. Total de produits trouvés: ${allProducts.length}`);
    
    // Sauvegarder les résultats dans un fichier JSON
    const outputPath = path.join(__dirname, OUTPUT_FILE);
    await fs.writeJson(outputPath, allProducts, { spaces: 2 });
    console.log(`Données sauvegardées dans: ${outputPath}`);
    
    return allProducts;
    
  } catch (error) {
    console.error('Une erreur est survenue lors du scraping:', error);
  } finally {
    await browser.close();
  }
}

// Exécuter le script
scrapeProducts()
  .then(products => {
    console.log('Scraping terminé avec succès!');
    console.log(`Total des produits extraits: ${products ? products.length : 0}`);
  })
  .catch(console.error);
