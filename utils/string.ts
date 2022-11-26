export const truncate = (longString: String, limit = 10) => {
  if (longString.length > limit) {
    return longString.substring(0, limit) + "...";
  }

  return longString;
};

export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
