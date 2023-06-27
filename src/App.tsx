// @ts-nocheck

import axios from "axios";
import cx from "classnames";
import { useMemo, useState } from "react";
import "./App.css";

import Gradient from "javascript-color-gradient";

const gradientArray = new Gradient()
  .setMidpoint(100)
  .setColorGradient("#2D2C2C", "#e82c07")
  .getColors();

const EVALUATOR_URL = "http://188.166.222.17:8080/evaluate_essay";

function App() {
  const [loading, setLoading] = useState(false);
  const [resultRaw, setResultRaw] = useState();
  const [essayInput, setEssayInput] = useState(undefined);

  const [hoveringWordIndex, setHoveringWordIndex] = useState<
    number | undefined
  >(undefined);

  const result = useMemo(() => {
    if (!resultRaw) {
      return [];
    }

    const words = resultRaw.words.map((word) => {
      return {
        word,
        probabilites: new Array<number>(),
      };
    });

    const frontToBack = resultRaw.heat_map["front-to-back"];
    const backToFront = resultRaw.heat_map["back-to-front"];

    for (let i = 0; i < frontToBack.length; i++) {
      const start = resultRaw.step * i;
      for (let j = start; j < start + resultRaw.n; j++) {
        words[j].probabilites.push(frontToBack[i]);
      }
    }

    for (let i = 0; i < backToFront.length; i++) {
      const start = words.length - 1 - resultRaw.step * i;
      for (let j = start; j > start - resultRaw.n; j--) {
        words[j].probabilites.push(backToFront[i]);
      }
    }

    const result = words.map(({ word, probabilites }) => {
      const sum = probabilites.reduce((a, b) => a + b, 0);
      const probability = sum / Math.max(1, probabilites.length);

      return {
        word,
        probability,
        color: gradientArray[Math.floor(probability * 100)],
      };
    });

    return result;
  }, [resultRaw]);

  const likelihood = useMemo(() => {
    return resultRaw ? (resultRaw.probability_llm * 100).toFixed(2) : 0;
  }, [resultRaw]);

  return (
    <div
      data-theme="night"
      className="flex flex-col items-center gap-8 px-8 py-8 sm:px-16 md:px-32 lg:px-48"
    >
      <div className="flex flex-col items-center w-full">
        <h1 className="py-8 text-4xl font-bold text-white">Behind the Words</h1>
        <textarea
          className="textarea w-full bg-[#2D2C2C] text-white"
          placeholder="Type an essay..."
          rows={12}
          onChange={(e) => {
            setEssayInput(e.target.value);
          }}
        />
      </div>
      <div className="flex justify-end w-full">
        <button
          className="btn btn-primary"
          onClick={async () => {
            if (essayInput) {
              setResultRaw(undefined);
              setLoading(true);

              const result = await axios.post(EVALUATOR_URL, {
                essay: essayInput,
              });

              setLoading(false);

              setResultRaw(result.data);
            }
          }}
        >
          {loading && <span className="loading loading-spinner"></span>}
          <p>GET RESULTS</p>
        </button>
      </div>
      {resultRaw && (
        <>
          <div className="flex flex-col items-center w-full">
            <h1 className="py-8 text-3xl font-bold text-white">
              {likelihood >= 50
                ? "Your essay is likely written by LLM"
                : "Your essay is likely written by Human"}
            </h1>
            <div className="bg-[#2D2C2C] w-full p-8 rounded-lg flex items-center gap-4">
              <progress
                className={cx(
                  "progress w-full bg-[#D9D9D9]",
                  likelihood >= 50 ? "progress-error" : "progress-success"
                )}
                value={likelihood}
                max="100"
              ></progress>
              <p className="text-2xl font-bold text-[#DDD1D1]">{likelihood}%</p>
            </div>
          </div>

          <div className="flex flex-col items-center w-full">
            <div className="bg-[#2D2C2C] w-full p-8 rounded-lg flex items-center gap-4">
              <p className="text-lg text-[#DDD1D1]">
                {result.map(({ word, color, probability }, idx) => {
                  const isHighlighted =
                    hoveringWordIndex !== undefined &&
                    idx >= hoveringWordIndex &&
                    idx < hoveringWordIndex + resultRaw.n;
                  return (
                    <span
                      key={idx}
                      className={cx(
                        "border-transparent border-t-2 border-b-2",
                        isHighlighted && "!border-blue-600",
                        idx === hoveringWordIndex && "border-l-2",
                        hoveringWordIndex &&
                          idx === hoveringWordIndex + resultRaw.n - 1 &&
                          "border-r-2"
                      )}
                    >
                      <span
                        className={cx(hoveringWordIndex === idx && "tooltip")}
                        data-tip={`Probability: ${(probability * 100).toFixed(
                          2
                        )}%`}
                        style={{
                          backgroundColor: color,
                        }}
                        onMouseOver={() => {
                          setHoveringWordIndex(idx);
                        }}
                        onMouseLeave={() => {
                          setHoveringWordIndex(undefined);
                        }}
                      >
                        {word}
                      </span>
                      <span> </span>
                    </span>
                  );
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center w-full">
            <h1 className="py-8 text-3xl font-bold text-white">Statistics</h1>
            <div className="bg-[#2D2C2C] w-full p-8 rounded-lg flex flex-col items-center gap-14">
              {Object.entries(resultRaw.statistics)
                .map(([key, statistic]) => {
                  return {
                    id: key,
                    ...statistic,
                  };
                })
                .map((statistic) => {
                  return (
                    <div key={statistic.id} className="w-full space-y-4">
                      <div className="flex items-center gap-2">
                        <p className="text-[#9F9595] text-2xl font-bold">
                          {statistic.label}:
                        </p>
                        <p className="text-2xl font-bold text-[#DDD1D1] underline">
                          {statistic.value.toFixed(2)}
                        </p>
                      </div>
                      <progress
                        className="progress progress-error w-full bg-[#D9D9D9]"
                        value={statistic.value}
                        max={statistic.max}
                      ></progress>
                      <p className="text-[#9F9595] text-lg">
                        {statistic.description}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
