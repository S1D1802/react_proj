import React from 'react'

const search = ({ searchTerm, setsearchTerm }) => {
    return (
        <div className='search'>
            <div>
                <img src='./search.svg' alt='search' />

                <input
                    type='text'
                    placeholder='Search Through Movies'
                    value={searchTerm}
                    onChange={(event) => setsearchTerm(event.target.value)}
                />
            </div>
        </div>
    )
}

export default search