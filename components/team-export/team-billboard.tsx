import { type ImageExportBackgroundId } from "@/utils/image-export-backgrounds";
import styles from "./team-billboard.module.css";

export function TeamBillboard({ id, name, background }: {
  id: string;
  name: string;
  background: ImageExportBackgroundId;
}) {
  return (
    <div className={`${styles.board} ${styles[background]}`} data-team-billboard>
      <span className={styles.support} aria-hidden="true" />
      <div className={styles.panel}>
        <span className={styles.fastener} aria-hidden="true" />
        <h2 id={id} title={name}>{name}</h2>
        <span className={styles.fastener} aria-hidden="true" />
      </div>
    </div>
  );
}
