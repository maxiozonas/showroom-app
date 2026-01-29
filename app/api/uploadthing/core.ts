import { createUploadthing, type FileRouter } from "uploadthing/next"

const f = createUploadthing()

export const ourFileRouter = {
  // Ruta específica para QR codes
  qrUploader: f({ 
    image: { 
      maxFileSize: "2MB",
      maxFileCount: 1,
    } 
  })
    .onUploadComplete(async ({ file }) => {
      return { url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
