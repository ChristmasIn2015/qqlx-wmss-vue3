import { getPage } from "qqlx-cdk";

export function getPage2(size?: number) {
  const p = getPage(size);

  const year = new Date().getFullYear();
  p.startTime = new Date(`${year - 1}/01/01 00:00`).getTime();
  return p;
}
