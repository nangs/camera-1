import styled, {keyframes} from "styled-components";


export const color = {
    primary: 'rgb(0, 82, 204, 1)',
    body: '#141823',
    bold: '#172B4D',
    border: 'rgba(0,0,0,0.05)',
    error: '#721c24',
    success: '#155724'
};
export const sidebar = {
    width: 250,
}


export const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

export const Spinner = styled.div `
    display: block;
    text-align: center;
    width: 100%;
    div {
         animation: ${rotate360} 2s linear infinite;
         margin: 0;
         height: 20px;
         width: 20px;
         border: 2px solid ${color.body};
         border-right-color: transparent;
         border-radius: 50%;
         display: inline-block;
    }
`
export const More = styled.div `
    width: 100%;
    text-align: center;
    button {
        background: none;
        border: 1px solid ${color.border};
        padding: 7px 15px;
        display: inline-block;
        cursor: pointer;
        font-weight: 700;
    }
`

