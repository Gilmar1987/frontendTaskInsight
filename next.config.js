/** @type {import('next').NextConfig} */

const NODE_URL = process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:3000";
const PYTHON_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

console.log("\x1b[36m\n  ▲ TaskInsight — APIs configuradas");
console.log(`\x1b[32m    Node.js API  \x1b[0m→  ${NODE_URL}`);
console.log(`\x1b[35m    FastAPI      \x1b[0m→  ${PYTHON_URL}\n`);

const nextConfig = {
  async rewrites() {
    const nodeUrl = process.env.NEXT_PUBLIC_NODE_API_URL || "http://localhost:3000";
    const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || "http://localhost:8000";

    return [
      {
        source: "/api/node/:path*",
        destination: `${nodeUrl}/api/:path*`,
      },
      {
        source: "/api/python/:path*",
        destination: `${pythonUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
