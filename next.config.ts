/** @type {import('next').NextConfig} */
const nextConfig = {
 // Tells Next.js to generate static HTML/CSS/JS
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
