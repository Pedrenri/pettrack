/** Returns a human-readable age string from an ISO date string (YYYY-MM-DD). */
export function calcAge(birthday: string): string {
  const birth = new Date(birthday);
  const now = new Date();
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth()) -
    (now.getDate() < birth.getDate() ? 1 : 0);

  if (totalMonths < 1) return "< 1 mo";
  if (totalMonths < 12) return `${totalMonths} mo`;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  return m > 0 ? `${y}y ${m}mo` : `${y}y`;
}
