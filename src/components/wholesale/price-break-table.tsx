type PriceBreak = { minQuantity: number; price: number };

export function PriceBreakTable({ basePrice, priceBreaks }: { basePrice: number; priceBreaks: PriceBreak[] }) {
  if (priceBreaks.length === 0) return null;

  return (
    <table className="mt-2 w-full text-xs text-ink/70">
      <tbody>
        <tr>
          <td className="py-0.5">1+</td>
          <td className="py-0.5 text-right">${basePrice.toFixed(2)}</td>
        </tr>
        {priceBreaks.map((pb) => (
          <tr key={pb.minQuantity}>
            <td className="py-0.5">{pb.minQuantity}+</td>
            <td className="py-0.5 text-right">${pb.price.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
