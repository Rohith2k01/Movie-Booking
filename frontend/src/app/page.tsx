
import Movies from "@/components/Movies/Movies";
import styles from "./page.module.css";
import Banner from "@/components/Banner/Banner";

export default function Home() {
  return (
    <main className={styles.main}>
      <Banner/>
      <Movies/>
    </main>
  );
} 
