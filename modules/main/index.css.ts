import { Styles } from '@ijstech/components';

const Theme = Styles.Theme.ThemeVars;

const spin = Styles.keyframes({
    "to": {
        "-webkit-transform": "rotate(360deg)"
    }
})

export default Styles.style({
  $nest: {
    '.spinner': {
        display: "inline-block",
        width: "50px",
        height: "50px",
        border: "3px solid rgba(255,255,255,.3)",
        borderRadius: "50%",
        borderTopColor: Theme.colors.primary.main,
        "animation": `${spin} 1s ease-in-out infinite`,
        "-webkit-animation": `${spin} 1s ease-in-out infinite`
    }
  }
});