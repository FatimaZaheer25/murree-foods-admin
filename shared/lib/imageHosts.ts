// Dish ki photo kahan se aa sakti hai. Backend ki src/config/imageHosts.ts mein bhi yehi list hai.
// next.config.ts isi se Next.js ko batata hai ke kin websites ki photos chhoti (optimize) karni hain
export const IMAGE_HOSTS = ["res.cloudinary.com", "images.unsplash.com", "i.ibb.co", "i.imgur.com"];

export const IMAGE_RULE = "Photo must be an https link from Cloudinary, Unsplash, ImgBB or Imgur, or a /images/ path.";

export const isAllowedImage = (value: string) => {
  // Website ke andar ki photo: /images/foods/naan.jpg
  if (value.startsWith("/")) return /^\/images\/[\w-]+(\/[\w-]+)*\.(jpe?g|png|webp|avif)$/i.test(value);

  try {
    const url = new URL(value);
    return url.protocol === "https:" && IMAGE_HOSTS.includes(url.hostname) && !url.port && !url.username && !url.password;
  } catch {
    return false;
  }
};
