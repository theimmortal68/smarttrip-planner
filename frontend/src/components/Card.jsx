import React from 'react'

const Card = ({children}) => {
  return (
    <div className={"bg-gradient-to-b from-white-400 from-75% to-indigo-900 to-50% p-6 border-3 rounded-lg shadow-lg"}>{children}</div>
  )
}

export default Card