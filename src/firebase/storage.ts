// Firebase Storage placeholder / mock fallback if storage bucket is used
export async function uploadFile(path: string, _file: File): Promise<string> {
  // Returns placeholder URL or base64 data url
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400`);
    }, 500);
  });
}
