import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// Função para criar o arquivo .ico encapsulando um PNG
function createIcoFromPng(pngBuffer: Buffer, width: number, height: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);     // Reservado (0)
  header.writeUInt16LE(1, 2);     // Tipo (1 para ICO)
  header.writeUInt16LE(1, 4);     // Número de imagens (1)

  const directory = Buffer.alloc(16);
  directory.writeUInt8(width >= 256 ? 0 : width, 0);   // Largura
  directory.writeUInt8(height >= 256 ? 0 : height, 1);  // Altura
  directory.writeUInt8(0, 2);                          // Contagem de cores na paleta (0)
  directory.writeUInt8(0, 3);                          // Reservado (0)
  directory.writeUInt16LE(1, 4);                       // Planos de cor (1)
  directory.writeUInt16LE(32, 6);                      // Bits por pixel (32)
  directory.writeUInt32LE(pngBuffer.length, 8);        // Tamanho do PNG em bytes
  directory.writeUInt32LE(22, 12);                     // Offset (22 bytes)

  return Buffer.concat([header, directory, pngBuffer]);
}

async function generate() {
  console.log('Iniciando geração de favicons corrigida para ESM...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // HTML com o design do logotipo oficial de alta fidelidade
  // Com o mesmo gradiente: from-sky-600 via-sky-500 to-cyan-400
  // linear-gradient(135deg, #0284c7, #0ea5e9, #22d3ee)
  // E o ícone Sparkles centralizado e preenchido de branco para excelente visibilidade
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 512px;
          height: 512px;
        }
        #logo-container {
          width: 512px;
          height: 512px;
          background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #22d3ee 100%);
          border-radius: 112px; /* ~22% squircle border radius para visual moderno e amigável */
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          box-shadow: 0 20px 50px rgba(2, 132, 199, 0.3);
        }
        #sparkle-icon {
          width: 300px;
          height: 300px;
          color: white;
        }
      </style>
    </head>
    <body>
      <div id="logo-container">
        <!-- SVG oficial da faísca (Sparkles) -->
        <svg id="sparkle-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        </svg>
      </div>
    </body>
    </html>
  `;

  await page.setContent(htmlContent);
  await page.evaluate(() => document.body.style.background = 'transparent');

  const element = await page.$('#logo-container');
  if (!element) {
    throw new Error('Elemento de logotipo não encontrado!');
  }

  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Gera o PNG principal de 512x512
  console.log('Gere PNG de 512x512...');
  const png512 = await element.screenshot({ omitBackground: true });
  fs.writeFileSync(path.join(publicDir, 'favicon-512.png'), png512);
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), png512); // Favicon principal PNG estável

  // 2. Redimensiona/captura PNG de 192x192 para Android/PWA
  console.log('Gere PNG de 192x192...');
  await page.evaluate(() => {
    const container = document.getElementById('logo-container')!;
    container.style.width = '192px';
    container.style.height = '192px';
    container.style.borderRadius = '42px';
    const icon = document.getElementById('sparkle-icon')!;
    icon.style.width = '112px';
    icon.style.height = '112px';
  });
  const element192 = await page.$('#logo-container');
  const png192 = await element192!.screenshot({ omitBackground: true });
  fs.writeFileSync(path.join(publicDir, 'favicon-192.png'), png192);

  // 3. Redimensiona/captura PNG de 48x48 para navegadores de desktop
  console.log('Gere PNG de 48x48...');
  await page.evaluate(() => {
    const container = document.getElementById('logo-container')!;
    container.style.width = '48px';
    container.style.height = '48px';
    container.style.borderRadius = '10px';
    const icon = document.getElementById('sparkle-icon')!;
    icon.style.width = '28px';
    icon.style.height = '28px';
    icon.style.strokeWidth = '2'; // Aumenta levemente a espessura para telas pequenas
  });
  const element48 = await page.$('#logo-container');
  const png48 = await element48!.screenshot({ omitBackground: true });
  fs.writeFileSync(path.join(publicDir, 'favicon-48.png'), png48);

  // 4. Redimensiona/captura PNG de 32x32 para navegadores legado
  console.log('Gere PNG de 32x32...');
  await page.evaluate(() => {
    const container = document.getElementById('logo-container')!;
    container.style.width = '32px';
    container.style.height = '32px';
    container.style.borderRadius = '7px';
    const icon = document.getElementById('sparkle-icon')!;
    icon.style.width = '19px';
    icon.style.height = '19px';
  });
  const element32 = await page.$('#logo-container');
  const png32 = await element32!.screenshot({ omitBackground: true });
  fs.writeFileSync(path.join(publicDir, 'favicon-32.png'), png32);

  // 5. Gera o arquivo .ico encapsulando o PNG de 48x48
  console.log('Gere o arquivo favicon.ico...');
  const icoBuffer = createIcoFromPng(png48, 48, 48);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

  console.log('Todos os favicons foram gerados com sucesso!');
  await browser.close();
}

generate().catch(console.error);
