// src/features/catalog/AtaudGrid.jsx
import PropTypes from 'prop-types'
import AtaudCard from './AtaudCard.jsx'

export default function AtaudGrid({ items, onView }) {
  if (!items?.length) return null

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((ataud) => (
        <AtaudCard
          key={ataud.id}
          ataud={ataud}
          onView={onView}
        />
      ))}
    </div>
  )
}

AtaudGrid.propTypes = {
  items: PropTypes.array,
  onView: PropTypes.func,
}
