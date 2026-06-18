import { openExternalLink } from "../telegram.ts";

const COURSE_URL = import.meta.env.VITE_COURSE_URL ?? "https://fajr-sestram.ru";

export default function CoursePromo() {
  return (
    <div className="card course-promo">
      <div className="course-eyebrow">Курс о ранних подъёмах</div>
      <h2>Хочешь вставать рано — с системой и поддержкой?</h2>
      <p className="hint">
        Присоединяйся к курсу: разбор привычек раннего подъёма, поддержка наставниц и закрытое сообщество тех, кто
        встаёт на рассвете.
      </p>
      <button className="btn btn-primary" onClick={() => openExternalLink(COURSE_URL)}>
        Присоединиться к курсу
      </button>
    </div>
  );
}
