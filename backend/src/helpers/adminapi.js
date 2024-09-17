
module.exports = {
  
    searchMovie: async (title,year) => {
      try {
        const searchMovieApi = 'http://www.omdbapi.com/?t=${title}&y=${year}&apikey=79cc66dd'
        console.log(searchMovieApi)
        return searchMovieApi
        
      } catch (error) {
        console.log(error);
        return error
      }
    },
  
  };
  