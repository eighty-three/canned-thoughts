const PaginationReducer = (state, action) => {
  switch (action.type) {
    case 'first': {
      // If the query is more than 10, it means that there should be a next page
      // because the display is only for 10 posts.
      const nextButtonState = (action.payload.length > 10) ? false : true;

      return { 
        page: 1,
        posts: action.payload,
        prevButtonDisabled: true,
        nextButtonDisabled: nextButtonState
      };
    }

    case 'update': {
      // If the page before the incoming page is the last one (below 1), then disable the button
      const prevButtonState = (action.payload.page - 1 < 1) ? true : false;

      // If the query is more than 10, it means that there should be a next page
      // because the display is only for 10 posts.
      const nextButtonState = (action.payload.posts.length > 10) ? false : true;

      return { 
        page: action.payload.page,
        posts: action.payload.posts,
        prevButtonDisabled: prevButtonState,
        nextButtonDisabled: nextButtonState
      };
    }

    case 'prev': {
      // Same for both as in 'update'
      const prevButtonState = (state.page - 1 <= 1) ? true : false;
      const nextButtonState = (action.payload.length > 10) ? false : true;

      return {
        page: state.page - 1,
        posts: action.payload,
        prevButtonDisabled: prevButtonState,
        nextButtonDisabled: nextButtonState
      };
    }

    case 'next': {
      // Same as in 'update'
      const buttonState = (action.payload.length > 10) ? false : true;

      return {
        page: state.page + 1,
        posts: action.payload,
        prevButtonDisabled: false,
        nextButtonDisabled: buttonState
      };
    }
  }
};

export default PaginationReducer;
