

export const Loading = ({ children }) => <div>{children}</div>
export const Button = ({ children, onClick }) => <button onClick={onClick}>{children}</button>
export const Toast = { show: () => {}, hide: () => {} }
// Add other components as needed
