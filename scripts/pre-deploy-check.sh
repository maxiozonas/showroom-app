#!/bin/bash

# 🔍 Pre-Deploy Checklist Script
# Verifica que todo esté listo para deployar en Vercel

echo "🔍 Verificando configuración para deployment en Vercel..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# 1. Verificar archivos esenciales
echo "📁 Verificando archivos esenciales..."

if [ -f "package.json" ]; then
    echo -e "${GREEN}✓${NC} package.json existe"
else
    echo -e "${RED}✗${NC} package.json NO encontrado"
    ((ERRORS++))
fi

if [ -f "next.config.ts" ]; then
    echo -e "${GREEN}✓${NC} next.config.ts existe"
else
    echo -e "${RED}✗${NC} next.config.ts NO encontrado"
    ((ERRORS++))
fi

if [ -f "prisma/schema.prisma" ]; then
    echo -e "${GREEN}✓${NC} prisma/schema.prisma existe"
else
    echo -e "${RED}✗${NC} prisma/schema.prisma NO encontrado"
    ((ERRORS++))
fi

if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓${NC} vercel.json existe"
else
    echo -e "${YELLOW}⚠${NC} vercel.json NO encontrado (opcional)"
    ((WARNINGS++))
fi

echo ""

# 2. Verificar scripts en package.json
echo "📦 Verificando scripts en package.json..."

if grep -q '"build".*"prisma generate' package.json; then
    echo -e "${GREEN}✓${NC} Script 'build' incluye 'prisma generate'"
else
    echo -e "${RED}✗${NC} Script 'build' NO incluye 'prisma generate'"
    ((ERRORS++))
fi

if grep -q '"postinstall".*"prisma generate' package.json; then
    echo -e "${GREEN}✓${NC} Script 'postinstall' configurado"
else
    echo -e "${YELLOW}⚠${NC} Script 'postinstall' NO configurado (recomendado)"
    ((WARNINGS++))
fi

echo ""

# 3. Verificar variables de entorno
echo "🔐 Verificando archivo .env.example..."

if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓${NC} .env.example existe"
    
    if grep -q "DATABASE_URL" .env.example; then
        echo -e "${GREEN}✓${NC} DATABASE_URL definida en .env.example"
    else
        echo -e "${RED}✗${NC} DATABASE_URL NO definida en .env.example"
        ((ERRORS++))
    fi
    
    if grep -q "UPLOADTHING_TOKEN" .env.example; then
        echo -e "${GREEN}✓${NC} UPLOADTHING_TOKEN definida en .env.example"
    else
        echo -e "${RED}✗${NC} UPLOADTHING_TOKEN NO definida en .env.example"
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} .env.example NO encontrado"
    ((WARNINGS++))
fi

echo ""

# 4. Verificar dependencias críticas
echo "📚 Verificando dependencias críticas..."

if grep -q '"@prisma/client"' package.json; then
    echo -e "${GREEN}✓${NC} @prisma/client instalado"
else
    echo -e "${RED}✗${NC} @prisma/client NO encontrado"
    ((ERRORS++))
fi

if grep -q '"prisma"' package.json; then
    echo -e "${GREEN}✓${NC} prisma instalado"
else
    echo -e "${RED}✗${NC} prisma NO encontrado"
    ((ERRORS++))
fi

if grep -q '"uploadthing"' package.json; then
    echo -e "${GREEN}✓${NC} uploadthing instalado"
else
    echo -e "${RED}✗${NC} uploadthing NO encontrado"
    ((ERRORS++))
fi

echo ""

# 5. Verificar configuración de Next.js
echo "⚙️  Verificando next.config.ts..."

if grep -q "utfs.io" next.config.ts; then
    echo -e "${GREEN}✓${NC} Dominio de UploadThing configurado"
else
    echo -e "${YELLOW}⚠${NC} Dominio de UploadThing NO configurado en remotePatterns"
    ((WARNINGS++))
fi

echo ""

# 6. Verificar .gitignore
echo "🚫 Verificando .gitignore..."

if [ -f ".gitignore" ]; then
    if grep -q "\.env" .gitignore; then
        echo -e "${GREEN}✓${NC} .env en .gitignore"
    else
        echo -e "${RED}✗${NC} .env NO está en .gitignore (CRÍTICO)"
        ((ERRORS++))
    fi
    
    if grep -q "node_modules" .gitignore; then
        echo -e "${GREEN}✓${NC} node_modules en .gitignore"
    else
        echo -e "${YELLOW}⚠${NC} node_modules NO está en .gitignore"
        ((WARNINGS++))
    fi
else
    echo -e "${RED}✗${NC} .gitignore NO encontrado"
    ((ERRORS++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Resumen
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Todo listo para deployar en Vercel!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Sube tu código a GitHub/GitLab/Bitbucket"
    echo "2. Ve a https://vercel.com/new"
    echo "3. Importa tu repositorio"
    echo "4. Configura las variables de entorno:"
    echo "   - DATABASE_URL"
    echo "   - UPLOADTHING_TOKEN"
    echo "5. Click en 'Deploy'"
    echo ""
    echo "📚 Ver guía completa: DEPLOYMENT_GUIDE.md"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Hay $WARNINGS advertencia(s), pero puedes deployar${NC}"
    echo ""
    echo "Revisa las advertencias arriba para mejorar tu deployment."
    exit 0
else
    echo -e "${RED}❌ Hay $ERRORS error(es) que deben corregirse antes de deployar${NC}"
    echo ""
    echo "Por favor, corrige los errores marcados con ✗ antes de continuar."
    exit 1
fi
