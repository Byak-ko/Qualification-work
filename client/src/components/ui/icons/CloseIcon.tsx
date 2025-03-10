import { IconProps } from "./icon-props"


const CloseIcon = ({ ...props }: IconProps) => {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" widths={`${props.width ? props.width : '24px'}`} height={`${props?.height ? props.height : '24px'}`} viewBox="0 0 50 50">
            <path d="M 7.71875 6.28125 L 6.28125 7.71875 L 23.5625 25 L 6.28125 42.28125 L 7.71875 43.71875 L 25 26.4375 L 42.28125 43.71875 L 43.71875 42.28125 L 26.4375 25 L 43.71875 7.71875 L 42.28125 6.28125 L 25 23.5625 Z"></path>
        </svg>
    )
}

export default CloseIcon