import React from 'react';
import { DollarsDisplay } from './DollarsDisplay';
import { GoldResourceDisplay } from './GoldResourceDisplay';
import { SilverDisplay } from './SilverDisplay';
import { CurrencyDisplay } from './CurrencyDisplay';
import { ResourceBar } from './ResourceBar';

/**
 * CurrencyShowcase Component
 * Example/demo component showing all currency display variations
 * This can be used for testing or documentation purposes
 */
export const CurrencyShowcase: React.FC = () => {
  return (
    <div className="p-6 space-y-8 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold">Currency Display Components Showcase</h2>

      {/* DollarsDisplay Examples */}
      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-green-400">DollarsDisplay</h3>
        <div className="space-y-2 p-4 bg-gray-800 rounded">
          <div className="flex items-center gap-4">
            <span className="w-32 text-gray-400">Small:</span>
            <DollarsDisplay amount={1250} size="sm" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-32 text-gray-400">Medium:</span>
            <DollarsDisplay amount={5000} size="md" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-32 text-gray-400">Large:</span>
            <DollarsDisplay amount={15750} size="lg" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-32 text-gray-400">No Icon:</span>
            <DollarsDisplay amount={3000} showIcon={false} />
          </div>
        </div>
      </section>

      {/* GoldResourceDisplay Examples */}
      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-amber-400">GoldResourceDisplay</h3>
        <div className="space-y-2 p-4 bg-gray-800 rounded">
          <div className="flex items-center gap-4">
            <span className="w-32 text-gray-400">Compact:</span>
            <GoldResourceDisplay amount={45} size="sm" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-32 text-gray-400">Medium:</span>
            <GoldResourceDisplay amount={125} size="md" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-32 text-gray-400">Large:</span>
            <GoldResourceDisplay amount={500} size="lg" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-32 text-gray-400">Verbose:</span>
            <GoldResourceDisplay amount={75} verbose={true} />
          </div>
        </div>
      </section>

      {/* SilverDisplay Examples */}
      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-400">SilverDisplay</h3>
        <div className="space-y-2 p-4 bg-gray-800 rounded">
          <div className="flex items-center gap-4">
            <span className="w-32 text-gray-400">Compact:</span>
            <SilverDisplay amount={250} size="sm" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-32 text-gray-400">Medium:</span>
            <SilverDisplay amount={680} size="md" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-32 text-gray-400">Large:</span>
            <SilverDisplay amount={1500} size="lg" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-32 text-gray-400">Verbose:</span>
            <SilverDisplay amount={420} verbose={true} />
          </div>
        </div>
      </section>

      {/* CurrencyDisplay Generic Examples */}
      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-blue-400">CurrencyDisplay (Generic)</h3>
        <div className="space-y-2 p-4 bg-gray-800 rounded">
          <div className="flex items-center gap-4">
            <span className="w-32 text-gray-400">Dollars:</span>
            <CurrencyDisplay amount={2000} type="dollars" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-32 text-gray-400">Gold:</span>
            <CurrencyDisplay amount={50} type="gold" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-32 text-gray-400">Silver:</span>
            <CurrencyDisplay amount={300} type="silver" />
          </div>
        </div>
      </section>

      {/* ResourceBar Examples */}
      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-purple-400">ResourceBar</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">All currencies:</p>
            <ResourceBar
              dollars={8750}
              goldResource={65}
              silverResource={480}
            />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Dollars only:</p>
            <ResourceBar dollars={15000} />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Dollars + Gold:</p>
            <ResourceBar dollars={3200} goldResource={25} />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Dollars + Silver:</p>
            <ResourceBar dollars={6500} silverResource={320} />
          </div>
        </div>
      </section>

      {/* Real-world Example */}
      <section className="space-y-3">
        <h3 className="text-xl font-semibold text-cyan-400">Real-world Example</h3>
        <div className="p-4 bg-gray-800 rounded space-y-4">
          <div className="border-b border-gray-700 pb-3">
            <h4 className="font-semibold mb-2">Character Inventory</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Cash on hand:</span>
                <DollarsDisplay amount={4325} />
              </div>
              <div className="flex justify-between">
                <span>Gold nuggets:</span>
                <GoldResourceDisplay amount={32} verbose={true} />
              </div>
              <div className="flex justify-between">
                <span>Silver ore:</span>
                <SilverDisplay amount={156} verbose={true} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Shop Item</h4>
            <div className="flex justify-between items-center">
              <span>Repeater Rifle</span>
              <DollarsDisplay amount={850} size="lg" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CurrencyShowcase;
