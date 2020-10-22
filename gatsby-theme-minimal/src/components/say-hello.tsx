import React from 'react';

type Props = {
  child: React.ReactNode
}

const Hello = ({ children }: Props) => {
  return (
    <div style={{ color: `red`, fontWeight: `bold` }}>
      SAY: {children}
    </div>
  )
}

export default Hello
