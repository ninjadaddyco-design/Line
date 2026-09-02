export const ADMIN_EMAIL = 'line@gmail.com';
export const ADMIN_PASSWORD = 'line123?';
export const ADMIN_SESSION_KEY = 'line_admin_session';

export const FREE_SHIPPING_THRESHOLD = 75;

export const US_STATES = [
  { value: 'AL', label: 'Alabama' }, { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' }, { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' }, { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' }, { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' }, { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' }, { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' }, { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' }, { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' }, { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' }, { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' }, { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' }, { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' }, { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' }, { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' }, { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' }, { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' }, { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' }, { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' }, { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' }, { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' }, { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' }, { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' }, { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' }, { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' }, { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' }
];

export const PRODUCT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  testing: 'Testing',
  active: 'Active',
  paused: 'Paused',
  winner: 'Winner',
  discontinued: 'Discontinued',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
  partially_refunded: 'Partially Refunded',
  chargeback: 'Chargeback',
};

export const FULFILLMENT_STATUS_LABELS: Record<string, string> = {
  awaiting_fulfillment: 'Awaiting Fulfillment',
  sent_to_cj: 'Sent to CJ',
  cj_processing: 'CJ Processing',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  fulfillment_error: 'Fulfillment Error',
  cancelled: 'Cancelled',
};

export const SIZE_CHART = [
  { size: 'XS', bust: '32"', waist: '25"', hips: '35"', us: '0-2' },
  { size: 'S',  bust: '34"', waist: '27"', hips: '37"', us: '4-6' },
  { size: 'M',  bust: '36"', waist: '29"', hips: '39"', us: '8-10' },
  { size: 'L',  bust: '38"', waist: '31"', hips: '41"', us: '12-14' },
  { size: 'XL', bust: '41"', waist: '34"', hips: '44"', us: '16-18' },
  { size: 'XXL',bust: '44"', waist: '37"', hips: '47"', us: '20-22' },
];

export const SHIPPING_COST = 7.99;
