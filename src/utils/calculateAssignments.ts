import { Level, Assignment } from "../types/mine.types";
import levelsData from "../levels.json"; // Путь зависит от структуры; скорректируйте если levels.json в app/

const levels: Level[] = levelsData as Level[];

export const calculateAssignments = (
  maxLevel: number,
  heroes: number,
  cycles: number
): {
  assignments: Assignment[];
  remaining: number;
  totalEmeralds: number;
} => {
  if (heroes < 4) {
    return { assignments: [], remaining: heroes, totalEmeralds: 0 };
  }

  const CYCLE_LENGTH = 192; // hours
  const STEP_SIZE = 4; // hours

  const available = levels
    .filter((m) => m.level <= maxLevel && (m.time === null || m.time >= 60))
    // Расчет ставки (изумруды в час)
    .map((m) => {
      let rate: number;
      if (m.time === null) {
        rate = m.emeralds / CYCLE_LENGTH; // Эффективная ставка для одноразовой награды за полный цикл
      } else {
        rate = m.time > 0 ? m.emeralds / m.time : 0;
      }
      return { ...m, rate };
    })
    .sort((a, b) => b.rate - a.rate);

  const result: Assignment[] = [];
  let left = heroes;

  for (const m of available) {
    if (left < 4) break;
    result.push(m);
    left -= 4;
  }

  // Новый расчет с учетом дискретных шагов по 4 часа и накопления по циклам
  const total_hours = cycles * CYCLE_LENGTH;
  const total_steps = Math.floor(total_hours / STEP_SIZE);

  let totalEmeralds = 0;

  for (let step = 1; step <= total_steps; step++) {
    const current_time = step * STEP_SIZE;


    const finishedMines = result.filter(
      (m) =>
        m.time !== null &&
        current_time % m.time === 0 
        // current_time / m.time <= cycles
    );

    for (const m of finishedMines) {
      totalEmeralds += m.emeralds;
      m.cycles = (m.cycles || 0) + 1;
    }
  }


  console.log (result)


  return { assignments: result, remaining: left, totalEmeralds };
};
