interface NumericCodeProps {
  code: string;
}

export const NumericCode = ({ code }: NumericCodeProps) => (
  <div className="my-5 text-center">
    {code.split("").map((digit, i) => (
      <span
        key={i}
        className="inline-block min-w-11 py-3 mx-1 bg-gray-50 border border-gray-200 rounded-lg text-xl font-mono font-bold text-gray-900"
      >
        {digit}
      </span>
    ))}
  </div>
);
