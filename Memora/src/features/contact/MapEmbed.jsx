import PropTypes from 'prop-types'
export default function MapEmbed({ query }){
const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
return (
<div className="w-full h-80 rounded-2xl overflow-hidden border">
<iframe title="Ubicación" src={src} className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
</div>
)
}
MapEmbed.propTypes = { query: PropTypes.string }