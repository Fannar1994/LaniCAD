export const placeholderImageHandler = (e: unknown): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const target = e.target as HTMLImageElement;
  target.src = "https://www.datocms-assets.com/65892/1664464657-placeholder-do-not-remove.jpg";
};
