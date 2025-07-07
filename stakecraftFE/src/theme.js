import { reactive } from 'vue';

const state = reactive({
    theme: localStorage.getItem('theme') || 'light'
});

export const useTheme = () => {
    const setTheme = (newTheme) => {
        state.theme = newTheme;
        localStorage.setItem('theme', newTheme);
    };

    return {
        theme: state.theme,
        setTheme
    };
};
