import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const keyPath = process.argv[2];
if (!keyPath || !fs.existsSync(keyPath)) {
    console.error('Usage: npm run seed -- ./serviceAccountKey.json');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(fs.readFileSync(path.resolve(keyPath), 'utf8')))
});
const db = admin.firestore();

const STUDENTS = [
    'Апсаматов Байэл', 'Арыкбаев Илгиз', 'Асанов Тимур', 'Асралиев Ислам',
    'Ахмулаева Рания', 'Ашарбеков Мурат', 'Бактыбеков Чынгыз', 'Замиров Дамирбек',
    'Исаев Нурдан', 'Каленов Нурсултан', 'Калыков Байзак', 'Колбаев Илияc',
    'Кочкомбаева Айдай', 'Кубанычбеков Амир', 'Курманбеков Чынтемир', 'Махамадов Байэл',
    'Мурзакулов Эржан', 'Наврузов Ярослав', 'Николаенко Руслан', 'Нуруев Нурсултан',
    'Патидинов Шавкат', 'Раимбаев Арслан', 'Салиев Кутманбек', 'Салижанов Элбек',
    'Соромбаева Асель', 'Темирбеков Санжар', 'Турумбеков Акыл', 'Харкей Арафат'
];

const SUBJECTS = [
    'Физическое воспитание',
    'Экономика отрасли',
    'Архитектура ЭВМ и вычислительных систем',
    'Системное программирование',
    'Правовое обеспечение профессиональной деятельности',
    'WEB-ориентированные информационные системы',
    'Разработка и эксплуатация информационных систем',
    'База данных',
    'Технологическая практика',
    'Курсовой проект Web-ориентированные информационные системы',
    'Курсовой проект объектно-ориентированное программирование',
    'Предпринимательство'
];

async function seed(colName, items, buildId, buildData) {
    console.log(`\n→ ${colName}`);
    for (let i = 0; i < items.length; i++) {
        const id = buildId(i);
        const ref = db.collection(colName).doc(id);
        const doc = await ref.get();
        if (!doc.exists) {
            await ref.set(buildData(i));
            console.log(`  ✓ ${id}`);
        } else {
            console.log(`  - ${id} (существует)`);
        }
    }
}

(async() => {
    await seed('students', STUDENTS,
        i => `s${String(i + 1).padStart(2, '0')}`,
        i => ({ name: STUDENTS[i], order: i + 1, claimedBy: null })
    );
    await seed('subjects', SUBJECTS,
        i => `sub${String(i + 1).padStart(2, '0')}`,
        i => ({ name: SUBJECTS[i], order: i + 1 })
    );
    console.log('\n✅ Готово.');
    process.exit(0);
})().catch(e => { console.error(e);
    process.exit(1); });