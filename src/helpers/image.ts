import got from "got";

export const Image = (() => {
  const fromUrl = async (src: string) => {
    const response = await got.get(src).buffer();

    return response;
  };
  return Object.freeze({ fromUrl });
})();
