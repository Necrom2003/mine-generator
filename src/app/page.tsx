"use client";

import { useState } from "react";
import levelsData from "./levels.json";
import styles from "./page.module.scss";
import { Gem, Pickaxe, Users, Zap, AlertCircle } from "lucide-react";

type Level = { mine: number; level: number; time: number | null; emeralds: number };
type Assignment = { mine: number; level: number; emeralds: number; time: number | null; rate: number };

const levels = levelsData as Level[];

export default function Home() {
  const [maxLevel, setMaxLevel] = useState(4780);
  const [heroes, setHeroes] = useState(40);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [remaining, setRemaining] = useState(0);

  const calculate = () => {
    if (heroes < 4) {
      setAssignments([]);
      setRemaining(heroes);
      return;
    }

    const available = levels
      .filter(m => m.level <= maxLevel && (m.time === null || m.time >= 60))
      .map(m => ({ ...m, rate: m.time ? (m.emeralds / m.time) * 60 : 0 }))
      .sort((a, b) => b.rate - a.rate);

    const result: Assignment[] = [];
    let left = heroes;

    for (const m of available) {
      if (left < 4) break;
      result.push(m);
      left -= 4;
    }

    setAssignments(result);
    setRemaining(left);
  };

  const totalEmeralds = assignments.reduce((sum, a) => {
    const mult = a.time === 60 ? 3 : a.time === 192 ? 1 : 0;
    return sum + a.emeralds * mult;
  }, 0);

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {/* Левая колонка — ввод */}
        <div className={styles.leftPanel}>
          <h1 className={styles.title}>
            <Gem className={styles.gem} />
            Калькулятор шахт
          </h1>

          <div className={styles.inputCard}>
            <div className={styles.inputRow}>
              <label><Pickaxe className={styles.icon} /> Макс. уровень</label>
              <input
                type="number"
                value={maxLevel}
                onChange={e => setMaxLevel(+e.target.value || 0)}
                placeholder="4780"
              />
            </div>

            <div className={styles.inputRow}>
              <label><Users className={styles.icon} /> Герои</label>
              <input
                type="number"
                value={heroes}
                onChange={e => setHeroes(+e.target.value || 0)}
                placeholder="40"
              />
            </div>

            <button onClick={calculate} className={styles.calcBtn}>
              <Zap className={styles.zap} /> Рассчитать
            </button>
          </div>

          {remaining > 0 && remaining < 4 && (
            <div className={styles.warning}>
              <AlertCircle className={styles.alert} />
              Осталось {remaining} героев — мало для новой шахты
            </div>
          )}
        </div>

        {/* Правая колонка — компактный результат */}
        <div className={styles.rightPanel}>
          {assignments.length > 0 && (
            <>
              <div className={styles.totalCard}>
                <div className={styles.totalLabel}>Всего за цикл</div>
                <div className={styles.totalValue}>
                  {totalEmeralds.toLocaleString()}
                  <Gem className={styles.totalGem} />
                </div>
              </div>

              <div className={styles.minesList}>
                {assignments.map(a => {
                  const mult = a.time === 60 ? 3 : a.time === 192 ? 1 : 0;
                  const reward = a.emeralds * mult;

                  return (
                    <div key={a.mine} className={styles.mineRow}>
                      <div className={styles.mineInfo}>
                        <span className={styles.mineNum}>Шахта {a.mine}</span>
                        <span className={styles.level}>ур. {a.level}</span>
                      </div>

                      <div className={styles.mineStats}>
                        <span className={styles.rate}>{a.rate.toFixed(1)}/ч</span>
                        <span className={styles.reward}>
                          {reward > 0 ? reward.toLocaleString() : a.emeralds}
                        </span>
                        {a.time === 60 && <span className={styles.bonus3x}>×3</span>}
                        {a.time === 192 && <span className={styles.bonus1x}>×1</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.footer}>
                <div>Осталось героев: <strong>{remaining}</strong></div>
                <div>Шахт занято: <strong>{assignments.length}</strong></div>
              </div>
            </>
          )}

          {assignments.length === 0 && heroes >= 4 && (
            <div className={styles.empty}>Нажмите «Рассчитать»</div>
          )}
        </div>
      </div>
    </div>
  );
}