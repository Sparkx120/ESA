'use strict';

export default {
    component: {
        width: '50%',
        display: 'inline-block',
        verticalAlign: 'top',
        padding: '20px',
        height: '47%',
        overflowY: 'auto',
        '@media (max-width: 640px)': {
            width: '100%',
            display: 'block'
        }
    },
    searchBox: {
        padding: '20px 20px 0 20px'
    },
    viewer: {
        base: {
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            backgroundColor: '#fff',
            border: 'solid 1px #ccc',
            borderRadius: '4px',
            padding: '20px',
            color: '#000',
            //minHeight: '250px',
            height: '100%',
            overflowY: 'auto',
        }
    }
};
