import styled from "styled-components";
import {color} from "../theme";

export const Table = styled.table `
    margin: 15px 0;
    display: inline-block;
    vertical-align: top;
    max-width: 100%;
    overflow-x: auto;
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    table-layout: fixed;
    display: table;
`
export const Thead = styled.thead `
    tr {
        background: none !important;
        background-color: #FFF;
    }
`
export const Tbody = styled.tbody `
    
`
export const Tr = styled.tr `
    background-color: #fff;
    &:nth-of-type(2n+1) {
        background-color: #fdfdfd;
    }
    &:hover{
        background-color: #fdfdfd;
    }
`
export const Td = styled.td `
    padding: 15px 8px;
    line-height: 1.42857143;
    vertical-align: top;
    border-bottom: 1px solid ${color.border};
    word-wrap: break-word;
  
`
export const Th = styled.th `
    padding: 15px 8px;
    line-height: 1.42857143;
    vertical-align: top;
    word-wrap: break-word;
    text-align: left;
    color: rgba(0,0,0,.8);
    background: none;
    font-weight: 700;
    border-bottom: 1px solid ${color.border};
    text-transform: uppercase;
`