import PropTypes from 'prop-types'
import { BANK_INFO } from '../../utils/constants.js'


export default function PaymentInfo({ pedido }){
if (!pedido) return null
return (
<div className="max-w-3xl mx-auto p-4">
<h1 className="text-2xl font-semibold mb-4">Instrucciones de Depósito</h1>
<div className="rounded-xl border p-4 mb-4">
<div className="font-semibold mb-2">Referencia de pago</div>
<div className="text-lg">{pedido.public_id || pedido.id}</div>
</div>
<div className="rounded-xl border p-4">
<div className="font-semibold mb-2">Datos Bancarios</div>
<ul className="text-sm space-y-1">
<li>Banco: {BANK_INFO.banco}</li>
<li>Cuenta: {BANK_INFO.cuenta}</li>
<li>CLABE: {BANK_INFO.clabe}</li>
<li>Titular: {BANK_INFO.titular}</li>
</ul>
</div>
</div>
)
}
PaymentInfo.propTypes = { pedido: PropTypes.object }