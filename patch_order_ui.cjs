const fs = require('fs');
let code = fs.readFileSync('src/pages/OrderPage.tsx', 'utf8');

const target = `{order.needs_payment && finalPaymentUrl && (
              <div className="bg-amber-50 p-6 border-t border-amber-200">
                 <p className="text-amber-800 text-sm mb-4 font-medium">This order is awaiting payment.</p>
                 <a 
                   href={finalPaymentUrl}
                   onClick={() => sessionStorage.setItem('woo_pending_payment_url', finalPaymentUrl)}
                   className="block w-full text-center bg-brand-primary text-white py-3 px-4 rounded-xl font-bold hover:bg-brand-secondary transition-colors"
                 >
                   Pay Now
                 </a>
              </div>
            )}`;

const newUI = `{order.needs_payment && finalPaymentUrl && (
              <div className="bg-amber-50 p-6 border-t border-amber-200">
                 {sessionStorage.getItem('woo_pending_payment_url') === finalPaymentUrl ? (
                   <div className="text-center">
                     <Loader2 className="w-8 h-8 text-brand-primary animate-spin mx-auto mb-3" />
                     <p className="text-amber-800 text-sm font-medium">Verifying payment status...</p>
                     <p className="text-amber-700/80 text-xs mt-2">If you have just completed your payment, please wait a moment. We are confirming it with the payment gateway.</p>
                     <a 
                       href={finalPaymentUrl}
                       className="inline-block mt-4 text-brand-primary text-sm font-bold hover:underline"
                     >
                       Click here to try again if payment failed
                     </a>
                   </div>
                 ) : (
                   <>
                     <p className="text-amber-800 text-sm mb-4 font-medium">This order is awaiting payment.</p>
                     <a 
                       href={finalPaymentUrl}
                       onClick={() => sessionStorage.setItem('woo_pending_payment_url', finalPaymentUrl)}
                       className="block w-full text-center bg-brand-primary text-white py-3 px-4 rounded-xl font-bold hover:bg-brand-secondary transition-colors"
                     >
                       Pay Now
                     </a>
                   </>
                 )}
              </div>
            )}`;

code = code.replace(target, newUI);
fs.writeFileSync('src/pages/OrderPage.tsx', code);
