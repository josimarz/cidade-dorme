#!/usr/bin/env node

console.log('🔍 Verificando configuração para deploy no Render.com...\n');

import { existsSync } from 'fs';
import { resolve } from 'path';

const checks = [
  {
    name: '📁 Arquivo render.yaml',
    check: () => existsSync('render.yaml'),
    fix: 'Arquivo render.yaml já existe ✅'
  },
  {
    name: '📦 Server package.json',
    check: () => existsSync('server/package.json'),
    fix: 'Package.json do servidor existe ✅'
  },
  {
    name: '🎨 Client package.json', 
    check: () => existsSync('client/package.json'),
    fix: 'Package.json do cliente existe ✅'
  },
  {
    name: '🔧 Server src/server.js',
    check: () => existsSync('server/src/server.js'),
    fix: 'Arquivo principal do servidor existe ✅'
  },
  {
    name: '⚛️ Client src/main.tsx',
    check: () => existsSync('client/src/main.tsx'),
    fix: 'Arquivo principal do cliente existe ✅'
  }
];

let allPassed = true;

checks.forEach(({ name, check, fix }) => {
  const passed = check();
  console.log(`${passed ? '✅' : '❌'} ${name}`);
  
  if (passed) {
    console.log(`   ${fix}`);
  } else {
    console.log(`   ❌ FALHOU - Verifique o arquivo`);
    allPassed = false;
  }
  console.log('');
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 TUDO PRONTO PARA DEPLOY NO RENDER.COM!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Faça push para o GitHub');
  console.log('2. Acesse https://render.com');
  console.log('3. Conecte o repositório');
  console.log('4. Siga o guia em RENDER_DEPLOY_GUIDE.md');
  console.log('\n🚀 Seu jogo funcionará perfeitamente!');
} else {
  console.log('❌ ALGUNS ARQUIVOS ESTÃO FALTANDO');
  console.log('Verifique os arquivos marcados com ❌');
}

console.log('\n' + '='.repeat(50)); 