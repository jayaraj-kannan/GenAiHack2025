import { useState, useEffect } from "react";
import { IndianRupee, Info, Calculator, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface BudgetEstimatorProps {
  destination: string;
  duration: number;
  moods: string[];
  onBudgetChange: (budget: number) => void;
}

interface BudgetBreakdown {
  accommodation: number;
  activities: number;
  food: number;
  transport: number;
  hiddenCosts: {
    localTransport: number;
    tips: number;
    fees: number;
    simCard: number;
    insurance: number;
    emergency: number;
  };
  total: number;
}

export function BudgetEstimator({ destination, duration, moods, onBudgetChange }: BudgetEstimatorProps) {
  const [budgetRange, setBudgetRange] = useState("moderate");
  const [customBudget, setCustomBudget] = useState(1000);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdown, setBreakdown] = useState<BudgetBreakdown | null>(null);

  const budgetRanges = {
    budget: { min: 50, max: 100, label: "Budget", color: "bg-green-100 text-green-800" },
    moderate: { min: 100, max: 250, label: "Moderate", color: "bg-blue-100 text-blue-800" },
    luxury: { min: 250, max: 500, label: "Luxury", color: "bg-purple-100 text-purple-800" },
    custom: { min: 50, max: 2000, label: "Custom", color: "bg-orange-100 text-orange-800" }
  };

  const calculateBudgetBreakdown = (baseBudget: number): BudgetBreakdown => {
    // Base percentages for different categories
    let accommodationRate = 0.35;
    let activitiesRate = 0.25;
    let foodRate = 0.25;
    let transportRate = 0.15;

    // Adjust rates based on travel moods
    if (moods.includes("luxury") || moods.includes("relax")) {
      accommodationRate = 0.45;
      foodRate = 0.30;
      activitiesRate = 0.15;
    } else if (moods.includes("adventure")) {
      activitiesRate = 0.35;
      accommodationRate = 0.25;
      transportRate = 0.25;
    } else if (moods.includes("culture")) {
      activitiesRate = 0.30;
      foodRate = 0.30;
    }

    // Calculate base costs
    const accommodation = baseBudget * accommodationRate;
    const activities = baseBudget * activitiesRate;
    const food = baseBudget * foodRate;
    const transport = baseBudget * transportRate;

    // Calculate hidden costs based on destination and duration
    const isInternational = !destination.toLowerCase().includes("usa") && 
                           !destination.toLowerCase().includes("united states");
    
    const hiddenCosts = {
      localTransport: Math.max(20, duration * 8), // $8-15 per day for local transport
      tips: Math.max(30, baseBudget * 0.05), // 5% of budget for tips
      fees: isInternational ? 150 : 50, // Higher fees for international (visas, etc.)
      simCard: isInternational ? 50 : 25, // International roaming/local SIM
      insurance: Math.max(50, duration * 5), // Travel insurance
      emergency: Math.max(100, baseBudget * 0.10) // 10% emergency buffer
    };

    const hiddenTotal = Object.values(hiddenCosts).reduce((sum, cost) => sum + cost, 0);
    const total = accommodation + activities + food + transport + hiddenTotal;

    return {
      accommodation,
      activities,
      food,
      transport,
      hiddenCosts,
      total
    };
  };

  const getBudgetForRange = (range: string): number => {
    if (range === "custom") return customBudget;
    const config = budgetRanges[range as keyof typeof budgetRanges];
    return ((config.min + config.max) / 2) * duration;
  };

  useEffect(() => {
    const budget = getBudgetForRange(budgetRange);
    const calculatedBreakdown = calculateBudgetBreakdown(budget);
    setBreakdown(calculatedBreakdown);
    setShowBreakdown(true); // Show breakdown by default after calculation
    onBudgetChange(calculatedBreakdown.total);
  }, [budgetRange, customBudget, destination, duration, moods, onBudgetChange]);

  const handleRangeSelect = (range: string) => {
    setBudgetRange(range);
    setShowBreakdown(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <IndianRupee className="h-5 w-5 text-green-500" />
        <h3 className="text-lg font-semibold">Dynamic Budget Estimator</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        AI-powered budget estimation including hidden costs for {destination}
      </p>

      {/* Budget Range Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(budgetRanges).map(([key, config]) => (
          <Card
            key={key}
            className={`p-4 cursor-pointer transition-all hover-elevate ${
              budgetRange === key 
                ? "border-primary bg-primary/5" 
                : "border-border"
            }`}
            onClick={() => handleRangeSelect(key)}
            data-testid={`budget-range-${key}`}
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </div>
              <h4 className="font-medium">{config.label}</h4>
              <p className="text-sm text-muted-foreground">
                {key === "custom" ? "Set your own" : `₹${config.min}-${config.max}/day`}
              </p>
              {budgetRange === key && (
                <Badge variant="default" className="mt-2 text-xs">
                  Selected
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Custom Budget Slider */}
      {budgetRange === "custom" && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Custom Budget</h4>
              <div className="text-lg font-bold text-primary">
                ₹{customBudget * duration}
              </div>
            </div>
            <div className="space-y-2">
              <Slider
                value={[customBudget]}
                onValueChange={(value) => setCustomBudget(value[0])}
                max={2000}
                min={50}
                step={25}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>₹50/day</span>
                <span>₹2000/day</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Budget Breakdown */}
      {breakdown && showBreakdown && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Smart Budget Breakdown</h4>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-lg font-bold text-primary">
                  ₹{Math.round(breakdown.total)}
                </span>
              </div>
            </div>

            {/* Main Categories */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  ₹{Math.round(breakdown.accommodation)}
                </div>
                <div className="text-xs text-muted-foreground">Accommodation</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  ₹{Math.round(breakdown.activities)}
                </div>
                <div className="text-xs text-muted-foreground">Activities</div>
              </div>
              <div>
                <div className="text-lg font-bold text-orange-600">
                  ₹{Math.round(breakdown.food)}
                </div>
                <div className="text-xs text-muted-foreground">Food</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">
                  ₹{Math.round(breakdown.transport)}
                </div>
                <div className="text-xs text-muted-foreground">Transport</div>
              </div>
            </div>

            {/* Hidden Costs Section */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-amber-500" />
                <h5 className="font-medium text-amber-700">Hidden Costs Included</h5>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div className="flex justify-between">
                  <span>Local Transport:</span>
                  <span className="font-medium">₹{Math.round(breakdown.hiddenCosts.localTransport)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tips & Service:</span>
                  <span className="font-medium">₹{Math.round(breakdown.hiddenCosts.tips)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fees & Visas:</span>
                  <span className="font-medium">₹{Math.round(breakdown.hiddenCosts.fees)}</span>
                </div>
                <div className="flex justify-between">
                  <span>SIM/Data:</span>
                  <span className="font-medium">₹{Math.round(breakdown.hiddenCosts.simCard)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insurance:</span>
                  <span className="font-medium">₹{Math.round(breakdown.hiddenCosts.insurance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency Buffer:</span>
                  <span className="font-medium">₹{Math.round(breakdown.hiddenCosts.emergency)}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex justify-between font-semibold">
                  <span>Total Hidden Costs:</span>
                  <span className="text-amber-600">
                    +₹{Math.round(Object.values(breakdown.hiddenCosts).reduce((sum, cost) => sum + cost, 0))}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                This budget includes all the costs most travelers forget: local transportation, 
                mandatory tips, visa fees, international SIM cards, travel insurance, and a safety buffer. 
                No surprises on your trip!
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}