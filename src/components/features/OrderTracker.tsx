import { CheckCircle, Circle, Package, Truck, MapPin, Home } from 'lucide-react';
import { Order } from '@/types';
import { FULFILLMENT_STATUS_LABELS } from '@/constants';

interface OrderTrackerProps {
  order: Order;
}

const STEPS = [
  { key: 'awaiting_fulfillment', label: 'Order Confirmed', icon: CheckCircle },
  { key: 'cj_processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'in_transit', label: 'In Transit', icon: MapPin },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

const STATUS_STEP_INDEX: Record<string, number> = {
  awaiting_fulfillment: 0,
  sent_to_cj: 0,
  cj_processing: 1,
  shipped: 2,
  in_transit: 3,
  delivered: 4,
  fulfillment_error: 0,
  cancelled: -1,
};

export default function OrderTracker({ order }: OrderTrackerProps) {
  const currentStepIndex = STATUS_STEP_INDEX[order.fulfillment_status] ?? 0;

  return (
    <div className="w-full">
      {/* Status */}
      <div className="mb-6 flex items-center gap-3">
        <span className={`px-3 py-1 text-xs font-bold tracking-wider uppercase ${
          order.fulfillment_status === 'delivered' ? 'bg-green-100 text-green-700' :
          order.fulfillment_status === 'fulfillment_error' ? 'bg-red-100 text-red-700' :
          order.fulfillment_status === 'cancelled' ? 'bg-gray-100 text-gray-600' :
          'bg-[#C9A96E]/10 text-[#0a0a0a]'
        }`}>
          {FULFILLMENT_STATUS_LABELS[order.fulfillment_status] || order.fulfillment_status}
        </span>
        <span className={`px-3 py-1 text-xs font-bold tracking-wider uppercase ${
          order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
          order.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          Payment: {order.payment_status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Progress bar */}
      {order.fulfillment_status !== 'cancelled' && (
        <div className="relative mb-8">
          <div className="flex justify-between relative z-10">
            {STEPS.map((step, i) => {
              const StepIcon = step.icon;
              const isDone = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 transition-all border-2 ${
                    isDone ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white' :
                    isCurrent ? 'border-[#C9A96E] bg-[#C9A96E]/10 text-[#C9A96E]' :
                    'border-gray-200 bg-white text-gray-300'
                  }`}>
                    <StepIcon size={14} />
                  </div>
                  <span className={`text-[10px] text-center leading-tight font-medium ${
                    isDone || isCurrent ? 'text-[#0a0a0a]' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-0 transform -translate-y-1/2">
            <div
              className="h-full bg-[#C9A96E] transition-all duration-500"
              style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Tracking info */}
      {order.tracking_number && (
        <div className="border border-gray-200 p-4 bg-gray-50/50">
          <p className="text-xs font-semibold tracking-wider uppercase text-gray-500 mb-2">Tracking Details</p>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Carrier</span>
              <span className="font-medium">{order.carrier || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tracking #</span>
              <span className="font-medium font-mono">{order.tracking_number}</span>
            </div>
            {order.estimated_delivery && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Est. Delivery</span>
                <span className="font-medium">{order.estimated_delivery}</span>
              </div>
            )}
            {order.tracking_url && (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-xs font-semibold tracking-wider uppercase text-[#0a0a0a] hover:text-[#C9A96E] underline transition-colors"
              >
                Track on Carrier Website →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {order.fulfillment_status === 'fulfillment_error' && (
        <div className="mt-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">Fulfillment Issue</p>
          <p>There was an issue fulfilling your order. Our team has been notified and will resolve this shortly. Please contact us if you don't hear back within 24 hours.</p>
        </div>
      )}
    </div>
  );
}
