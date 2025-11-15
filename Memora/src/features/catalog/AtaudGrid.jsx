import PropTypes from 'prop-types'
import AtaudCard from './AtaudCard.jsx'


export default function AtaudGrid({ items, onView }){
return (
<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{items?.map(i => (
<AtaudCard key={i.id} ataud={i} onView={onView} />
))}</div>
)
}
AtaudGrid.propTypes = { items: PropTypes.array, onView: PropTypes.func }