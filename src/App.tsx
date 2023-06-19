import cx from "classnames";
import { useState } from "react";
import "./App.css";

const makeFakeStatistics = () => {
  return [
    {
      label: "Lexical Diversity",
      description:
        "A document lexical diversity is a measurement of the variety of unique words or word tokens.",
      min: 0,
      max: 100,
      value: Math.floor(Math.random() * 10000) / 100,
    },
    {
      label: "Syntactic Complexity Score",
      description:
        "A document syntactic complexity is a measurement of the intricacy of the sentence structure and grammatical.",
      min: 0,
      max: 100,
      value: Math.floor(Math.random() * 10000) / 100,
    },
    {
      label: "Nominalization",
      description:
        "A document nominalization is a measurement of the frequency or occurrence of nominalized or noun-based forms",
      min: 0,
      max: 100,
      value: Math.floor(Math.random() * 10000) / 100,
    },
    {
      label: "Modals Score",
      description:
        "A document modality is a measurement of the frequency or distribution of modal verbs.",
      min: 0,
      max: 100,
      value: Math.floor(Math.random() * 10000) / 100,
    },
    {
      label: "Epistemic Markers Score",
      description:
        "A document epistemic markers is a measurement of the usage of linguistic expressions indicating the degree of certainty or belief regarding the information.",
      min: 0,
      max: 100,
      value: Math.floor(Math.random() * 10000) / 100,
    },
    {
      label: "Discourse Markers Score",
      description:
        "A document discourse markers is a measurement of the presence of linguistic expressions used to signal organizational or relational aspects of discourse, such as transitions, cohesion, or rhetorical devices.",
      min: 0,
      max: 100,
      value: Math.floor(Math.random() * 10000) / 100,
    },
  ];
};

function App() {
  const [showResult, setShowResult] = useState(false);
  const [likelihood, setLikelihood] = useState(Math.floor(Math.random() * 100));
  const [statistics, setStatistics] = useState(makeFakeStatistics());

  return (
    <div
      data-theme="night"
      className="px-48 py-8 flex flex-col items-center gap-8"
    >
      <div className="w-full flex flex-col items-center">
        <h1 className="text-4xl font-bold text-white py-8">Behind the Words</h1>
        <textarea
          className="textarea w-full bg-[#2D2C2C] text-white"
          placeholder="Bio"
          rows={12}
        />
      </div>
      <div className="w-full flex justify-end">
        <button
          className="btn btn-primary"
          onClick={() => {
            setLikelihood(Math.floor(Math.random() * 100));
            setStatistics(makeFakeStatistics());
            setShowResult(true);
          }}
        >
          GET RESULTS
        </button>
      </div>
      {showResult && (
        <>
          <div className="w-full flex flex-col items-center">
            <h1 className="text-3xl font-bold text-white py-8">
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

          <div className="w-full flex flex-col items-center">
            <h1 className="text-3xl font-bold text-white py-8">Statistics</h1>
            <div className="bg-[#2D2C2C] w-full p-8 rounded-lg flex flex-col items-center gap-14">
              {statistics.map((statistic, idx) => {
                return (
                  <div key={idx} className="w-full space-y-4">
                    <div className="flex items-center gap-2">
                      <p className="text-[#9F9595] text-2xl font-bold">
                        {statistic.label}:
                      </p>
                      <p className="text-2xl font-bold text-[#DDD1D1] underline">
                        {statistic.value}
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
