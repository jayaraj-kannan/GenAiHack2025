import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, IndianRupee, Calculator, TrendingUp, Info } from "lucide-react";

interface BudgetOption {
  total?: number;
  min?: number;
  max?: number;
  breakdown: Record<string, number>;
  notes: string[];
}

interface BudgetEstimation {
  budget: BudgetOption;
  moderate: BudgetOption;
  luxury: BudgetOption;
  custom: BudgetOption;
}

interface BudgetEstimatorProps {
  data: BudgetEstimation | null;
  onSelect: (total: number) => void;
}

export function BudgetEstimator({ data, onSelect }: BudgetEstimatorProps) {
  const [selectedRange, setSelectedRange] = useState<keyof BudgetEstimation>("moderate");

  useEffect(() => {
    if (data) {
      const total = data[selectedRange].total ?? Math.round((data[selectedRange].min! + data[selectedRange].max!) / 2);
      onSelect(total);
    }
  }, [data, selectedRange]);

  const formatCurrency = (value: number) =>
    `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  if (!data) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        Calculating budget...
      </div>
    );
  }

  const ranges: (keyof BudgetEstimation)[] = ["budget", "moderate", "luxury", "custom"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Smart Budget Estimator</h3>
            </div>
      
            <p className="text-sm text-muted-foreground">
              Choose your travel mode and get an estimated budget for your trip.
            </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ranges.map((range) => {
          const option = data[range];
          const displayTotal = option.total ?? Math.round((option.min! + option.max!) / 2);
          return (
            <Card
              key={range}
              className={`p-4 cursor-pointer transition-all ${
                selectedRange === range
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-muted/50"
              }`}
              onClick={() => setSelectedRange(range)}
            >
              <div className="text-center">
                <Calculator className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <h4 className="font-medium capitalize">{range}</h4>
                <p className="text-sm text-muted-foreground">
                  {range === "custom"
                    ? `₹${option.min}-${option.max}/day`
                    : formatCurrency(displayTotal)}
                </p>
                {selectedRange === range && <Badge className="mt-2 text-xs">Selected</Badge>}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Budget Breakdown */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Budget Breakdown</h4>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-lg font-bold text-primary">
              {formatCurrency(data[selectedRange].total ?? Math.round((data[selectedRange].min! + data[selectedRange].max!) / 2))}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {Object.entries(data[selectedRange].breakdown).map(([category, value]) => (
            <div key={category}>
              <div className="text-lg font-bold">{formatCurrency(value)}</div>
              <div className="text-xs text-muted-foreground capitalize">{category}</div>
            </div>
          ))}
        </div>

        {data[selectedRange].notes.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            <h5 className="font-medium flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-amber-500" />
              Tips & Notes
            </h5>
            <ul className="list-disc list-inside space-y-1">
              {data[selectedRange].notes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
