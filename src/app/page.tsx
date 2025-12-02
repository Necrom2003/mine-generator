"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState } from "react";
import levelsData from "./levels.json";

// Типы данных
type Level = {
  mine: number;      // номер шахты
  level: number;     // требуемый уровень шахты
  time: number | null; // время в минутах (null — мгновенно)
  emeralds: number;  // количество изумрудов
};

type Assignment = {
  mine: number;
  level: number;
  emeralds: number;
  time: number | null;
  rate: number;      // изумрудов в час
  assigned: number;  // сколько героев назначено
};

type AppState = {
  maxLevel: number;        // максимальный доступный уровень шахты
  heroesCount: number;     // общее количество героев
  assignments: Assignment[];
  remainingHeroes: number; // оставшиеся нераспределённые герои
};

const levels = levelsData as Level[];

export default function Home() {
  const [state, setState] = useState<AppState>({
    maxLevel: 4780,
    heroesCount: 40,
    assignments: [],
    remainingHeroes: 0,
  });

  // Обработка ввода чисел
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const name = e.target.name;

    if (isNaN(value) || value <= 0) return;

    setState((prev) =>
      name === "maxLevel"
        ? { ...prev, maxLevel: value }
        : { ...prev, heroesCount: value }
    );
  };

  // Основной расчёт оптимального распределения героев
  const handleCalculate = () => {
    const heroes = state.heroesCount;
    const maxMineLevel = state.maxLevel;

    if (heroes <= 0) {
      setState((prev) => ({ ...prev, assignments: [], remainingHeroes: 0 }));
      return;
    }

    // Доступные шахты: уровень ≤ максимальному и время ≥ 60 минут (или мгновенные не берём)
    const accessible = levels.filter(
      (m) => m.level <= maxMineLevel && (m.time === null || m.time >= 60)
    );

    // Считаем эффективность (изумрудов в час)
    const accessibleWithRate: (Level & { rate: number })[] = accessible.map((m) => {
      const time = typeof m.time === "number" && m.time > 0 ? m.time : Infinity;
      const rate = time !== Infinity ? (m.emeralds / time) * 60 : 0; // переводим в час
      return { ...m, rate };
    });

    // Сортируем по убыванию эффективности
    accessibleWithRate.sort((a, b) => b.rate - a.rate);

    const assignments: Assignment[] = [];
    let remaining = heroes;

    // Назначаем только полными группами по 4 героя
    for (const m of accessibleWithRate) {
      if (remaining < 4) break;

      const assign = 4;
      assignments.push({
        mine: m.mine,
        level: m.level,
        emeralds: m.emeralds,
        time: m.time,
        rate: m.rate,
        assigned: assign,
      });
      remaining -= assign;
    }

    setState((prev) => ({ ...prev, assignments, remainingHeroes: remaining }));
  };

  return (
    <main className={styles.main}>
      <div className={styles.inputGroup}>
        <label htmlFor="maxLevel">Максимальный уровень шахты</label>
        <input
          type="text"
          id="maxLevel"
          value={state.maxLevel}
          name="maxLevel"
          onChange={handleChange}
          placeholder="например: 4780"
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="heroesCount">Количество героев</label>
        <input
          type="text"
          id="heroesCount"
          value={state.heroesCount}
          name="heroesCount"
          onChange={handleChange}
          placeholder="например: 40"
        />
      </div>

      <button onClick={handleCalculate} className={styles.calculateBtn}>
        Рассчитать
      </button>

      {state.assignments.length > 0 && (
        <div className={styles.result}>
          <h3>Рекомендуемые назначения</h3>
          <ul>
            {state.assignments.map((a) => {
              // Множитель бонуса: 60 мин = x3, 192 мин = x1, остальное — без бонуса
              let multiplier = 0;
              let bonusText = "";
              if (a.time === 60) {
                multiplier = 3;
                bonusText = " (x3 бонус)";
              } else if (a.time === 192) {
                multiplier = 1;
                bonusText = " (x1)";
              }

              const totalEmeralds = a.emeralds * multiplier;

              return (
                <li key={a.mine}>
                  Шахта {a.mine} (ур. {a.level}): {a.assigned} геро
                  {a.assigned === 1 ? "й" : "ев"} —{" "}
                  <strong>{a.rate.toFixed(2)} изумрудов/час</strong>
                  {multiplier > 0 && (
                    <>
                      {" "}— <strong>{totalEmeralds} изумрудов</strong>
                      {bonusText}
                    </>
                  )}
                </li>
              );
            })}
          </ul>

          <div className={styles.summary}>
            <p>Осталось нераспределённых героев: <strong>{state.remainingHeroes}</strong></p>
            <p>
              Всего изумрудов за полный цикл:{" "}
              <strong style={{ color: "#2ecc71", fontSize: "1.2em" }}>
                {state.assignments.reduce((sum, a) => {
                  const multiplier = a.time === 60 ? 3 : a.time === 192 ? 1 : 0;
                  return sum + a.emeralds * multiplier;
                }, 0)}
              </strong>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}