import { execSync } from 'child_process'

// Archivos de API routes con logs
const apiFiles = [
  'app/api/auth/login/route.ts',
  'app/api/auth/logout/route.ts',
  'app/api/auth/me/route.ts',
  'app/api/history/route.ts',
  'app/api/history/[id]/route.ts',
  'app/api/import/route.ts',
  'app/api/products/route.ts',
  'app/api/products/[id]/route.ts',
  'app/api/qrs/delete-multiple/route.ts',
  'app/api/qrs/generate/route.ts',
  'app/api/qrs/generate-multiple/route.ts',
  'app/api/qrs/upload/route.ts',
  'app/api/uploadthing/core.ts',
]

// Comandos para eliminar logs
apiFiles.forEach(file => {
  try {
    // Eliminar console.log
    execSync(`sed -i '/console\\.log(/d' '${file}'`, { stdio: 'inherit' })
    console.log(`✅ Removed console.log from ${file}`)
    
    // Eliminar console.error y console.warn (solo en producción)
    // Nota: Mantenemos console.error para debugging en desarrollo
    execSync(`sed -i 's/console\\.error(/if (process.env.NODE_ENV !== '"'"'development'"'"') { console.error/g;/'${file}'`, { stdio: 'inherit' })
    console.log(`✅ Wrapped console.error in production check for ${file}`)
  } catch (error) {
    console.warn(`⚠️  Skipping ${file}:`, error)
  }
})

console.log('\n✅ Console logs cleanup completed!')
console.log('📝 Note: console.error is still available for debugging in development')
