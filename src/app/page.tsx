"use client";

import { useState } from "react";
import { calculateAssignments } from "../utils/calculateAssignments";  // Путь от app/ к utils/
import { useLocalStorageState } from "../hooks/useLocalStorageState";  // Путь от app/ к hooks/
import { DEFAULT_MAX_LEVEL, DEFAULT_HEROES, DEFAULT_CYCLES, LS_MAX_LEVEL, LS_HEROES, LS_CYCLES } from "../constants/mine.constants";  // Путь от app/ к constants/
import styles from "./page.module.scss";
import { Gem, Pickaxe, Users, Zap, AlertCircle, RefreshCw } from "lucide-react";
import { Assignment } from "../types/mine.types";  // Путь от app/ к types/

export default function Home() {
  // Инициализация состояний с использованием хука для localStorage
  const [maxLevel, setMaxLevel] = useLocalStorageState(
    LS_MAX_LEVEL,
    DEFAULT_MAX_LEVEL,
    (value) => parseInt(value, 10),
    (value) => value.toString()
  );
  const [heroes, setHeroes] = useLocalStorageState(
    LS_HEROES,
    DEFAULT_HEROES,
    (value) => parseInt(value, 10),
    (value) => value.toString()
  );
  const [cycles, setCycles] = useLocalStorageState(
    LS_CYCLES,
    DEFAULT_CYCLES,
    (value) => parseInt(value, 10),
    (value) => value.toString()
  );

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [totalEmeralds, setTotalEmeralds] = useState(0);

  const handleCalculate = () => {
    const { assignments: newAssignments, remaining: newRemaining, totalEmeralds } = calculateAssignments(maxLevel, heroes, cycles);
    setAssignments(newAssignments);
    setRemaining(newRemaining);
    setTotalEmeralds(totalEmeralds)
  };

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
                onChange={e => setMaxLevel(Math.max(0, +e.target.value || 0))}
                placeholder={DEFAULT_MAX_LEVEL.toString()}
                min="0"
              />
            </div>

            <div className={styles.inputRow}>
              <label><Users className={styles.icon} /> Герои</label>
              <input
                type="number"
                value={heroes}
                onChange={e => setHeroes(Math.max(0, +e.target.value || 0))}
                placeholder={DEFAULT_HEROES.toString()}
                min="0"
              />
            </div>

            {/* Новый ввод для количества циклов */}
            <div className={styles.inputRow}>
              <label><RefreshCw className={styles.icon} /> Циклы (×)</label>
              <input
                type="number"
                value={cycles}
                onChange={e => setCycles(Math.max(1, +e.target.value || 1))}
                placeholder={DEFAULT_CYCLES.toString()}
                min="1"
              />
            </div>

            <button onClick={handleCalculate} className={styles.calcBtn}>
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
                <div className={styles.totalLabel}>Всего за **{cycles}** цикл(а/ов)</div>
                <div className={styles.totalValue}>
                  {totalEmeralds.toLocaleString()}
                  <Gem className={styles.totalGem} />
                </div>
              </div>

              <div className={styles.minesList}>
                {assignments.map(a => {

                  return (
                    <div key={a.mine} className={styles.mineRow}>
                      <div className={styles.mineInfo}>
                        <span className={styles.mineNum}>{a.level}</span>
                        <span className={styles.level}>Шахта {a.mine}</span>
                      </div>

                      <div className={styles.mineStats}>
                        {/* Ставка/час не меняется от числа циклов */}
                        <span className={styles.rate}>{a.rate.toFixed(1)}/час</span>
                        {/* Показываем награду за один цикл */}
                        <span className={styles.reward}>
                          {a.emeralds}
                        </span>
                        <span className={styles.bonus3x}>×{a.cycles ?? 0}</span>

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

          {/* Добавлена проверка на 0 циклов */}
          {assignments.length === 0 && heroes >= 4 && cycles >= 1 && (
            <div className={styles.empty}>Нажмите «Рассчитать»</div>
          )}
        </div>
      </div>
    </div>
  );
}