'use client';

import { useState, useEffect } from 'react';
import NumberFlowLib, { type Value, type Trend } from "@number-flow/react";

export type { Trend };

interface NumberFlowProps {
  value: Value;
  trend?: Trend;
  duration?: number; // duração da animação em ms
  delay?: number; // delay antes da animação começar em ms
  currency?: boolean; // se deve mostrar R$
  decimals?: number; // número de casas decimais
  className?: string;
}

export function NumberFlow({ 
  value, 
  trend, 
  duration = 1000,
  delay = 0,
  currency = false,
  decimals,
  className = ""
}: NumberFlowProps) {
  const [currentValue, setCurrentValue] = useState<Value>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (delay > 0) {
      const delayTimer = setTimeout(() => {
        setIsAnimating(true);
        setCurrentValue(value);
      }, delay);
      
      return () => clearTimeout(delayTimer);
    } else {
      setIsAnimating(true);
      setCurrentValue(value);
    }
  }, [value, delay]);

  const formatValue = (val: Value): Value => {
    if (typeof val === 'number' && decimals !== undefined) {
      return Number(val.toFixed(decimals));
    }
    return val;
  };

  const displayValue = formatValue(currentValue);

  return (
    <span className={className}>
      {currency && "R$ "}
      <NumberFlowLib 
        value={isAnimating ? displayValue : 0} 
        trend={trend}
        duration={duration}
      />
    </span>
  );
}

// Componente especializado para moeda
export function NumberFlowCurrency({ 
  value, 
  trend, 
  duration = 1000, 
  delay = 0, 
  className = "" 
}: Omit<NumberFlowProps, 'currency' | 'decimals'>) {
  return (
    <NumberFlow 
      value={value}
      trend={trend}
      duration={duration}
      delay={delay}
      currency={true}
      decimals={2}
      className={className}
    />
  );
}

// Exemplo de uso
export function NumberFlowDemo() {
  const [value, setValue] = useState(0);
  
  const testValues = [1234.56, -500.25, 10000, 0, 999999.99];
  
  const changeValue = () => {
    const randomValue = testValues[Math.floor(Math.random() * testValues.length)];
    setValue(randomValue);
  };

  return (
    <div className="p-8 space-y-6">
      <button 
        onClick={changeValue}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Mudar Valor
      </button>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Número Normal:</h3>
          <div className="text-2xl font-bold">
            <NumberFlow value={value} />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Com Moeda:</h3>
          <div className="text-2xl font-bold text-green-600">
            <NumberFlowCurrency value={value} />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Com Delay e Duração Custom:</h3>
          <div className="text-2xl font-bold text-blue-600">
            <NumberFlow 
              value={value} 
              duration={2000} 
              delay={500}
              decimals={1}
            />
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Com Trend:</h3>
          <div className="text-2xl font-bold text-purple-600">
            <NumberFlow 
              value={value} 
              trend={value > 0 ? "increasing" : "decreasing"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}