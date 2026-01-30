

export const View = ({ children, className, onClick, ...props }) => <div className={className} onClick={onClick} {...props}>{children}</div>
export const Text = ({ children, className, onClick, ...props }) => <span className={className} onClick={onClick} {...props}>{children}</span>
export const Image = ({ src, className, mode, ...props }) => <img src={src} className={className} {...props} />
export const Button = ({ children, className, onClick, ...props }) => <button className={className} onClick={onClick} {...props}>{children}</button>
export const Input = ({ className, ...props }) => <input className={className} {...props} />
export const Textarea = ({ className, ...props }) => <textarea className={className} {...props} />
export const ScrollView = ({ children, className, ...props }) => <div className={className} {...props}>{children}</div>
export const Block = ({ children }) => <>{children}</>
// Add other components as needed
