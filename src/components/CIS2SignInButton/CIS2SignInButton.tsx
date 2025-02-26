import type { MouseEventHandler } from 'react';
import { Button } from 'nhsuk-react-components';

export function CIS2SignInButton({
  onClick,
}: {
  onClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <Button
      alt='Log in with my Care Identity'
      onClick={onClick}
      style={{
        width: '374.38px',
        height: '59px',
        margin: 0,
        marginBottom: 0,
        border: 'none',
        background: 'none',
        boxShadow: 'none',
        padding: 0,
      }}
    >
      <svg
        version='1.1'
        viewBox='0 0 374.38 59'
        xmlns='http://www.w3.org/2000/svg'
      >
        <defs>
          <style>
            {'.cls-1{fill:#003087;}.cls-2{fill:#005eb8;}.cls-3{fill:#fff;}'}
          </style>
        </defs>
        <title>CIS2_LogInWith_Original</title>
        <rect
          className='cls-1'
          y='4'
          width='374.38'
          height='55'
          rx='4.3598'
          strokeWidth='1.044'
        />
        <rect
          className='cls-2'
          width='374.38'
          height='55'
          rx='4.3598'
          strokeWidth='1.044'
        />
        <polygon
          className='cls-2'
          points='18.54 40.46 84.42 40.46 84.42 14.54 18.54 14.54'
        />
        <path
          className='cls-3'
          d='m85.05 41v-27h-67.05v27zm-40.05-24.39-4.67 21.73h-7.26l-4.57-15h-0.06l-3 15h-5.55l4.67-21.73h7.28l4.48 15.07h0.06l3.07-15.07zm20.77 0-4.57 21.73h-5.85l1.94-9.34h-6.92l-1.94 9.31h-5.85l4.54-21.73h5.88l-1.72 8.31h6.91l1.72-8.31zm16.81 0.59-1.41 4.33a11 11 0 0 0-4.82-1c-2.31 0-4.19 0.34-4.19 2.09 0 3.08 8.48 1.93 8.48 8.53 0 6-5.6 7.56-10.67 7.56a24.58 24.58 0 0 1-6.76-1.12l1.38-4.42a11.37 11.37 0 0 0 5.38 1.25c1.81 0 4.66-0.35 4.66-2.59 0-3.49-8.48-2.18-8.48-8.31 0-5.61 4.94-7.29 9.73-7.29a17.91 17.91 0 0 1 6.7 1z'
        />
        <g fill='#fff' strokeWidth='.96013'>
          <path d='m102.1 34.121v-13.633h2.7754v11.317h6.9009v2.3159z' />
          <path d='m113.13 29.002q0-1.3127 0.64696-2.541t1.8284-1.8752q1.1908-0.64696 2.6535-0.64696 2.2597 0 3.7036 1.4721 1.4439 1.4627 1.4439 3.7036 0 2.2597-1.4627 3.7505-1.4533 1.4814-3.6661 1.4814-1.3689 0-2.616-0.61883-1.2377-0.61883-1.8846-1.8096-0.64696-1.2002-0.64696-2.916zm2.7004 0.14064q0 1.4814 0.70322 2.269 0.70321 0.7876 1.7346 0.7876 1.0314 0 1.7252-0.7876 0.70322-0.7876 0.70322-2.2878 0-1.4627-0.70322-2.2503-0.69384-0.7876-1.7252-0.7876-1.0314 0-1.7346 0.7876-0.70322 0.7876-0.70322 2.269z' />
          <path d='m125.22 34.778 3.0098 0.36567q0.075 0.52507 0.34692 0.72197 0.37505 0.28129 1.1814 0.28129 1.0314 0 1.5471-0.30942 0.34692-0.20628 0.52507-0.66571 0.12189-0.32817 0.12189-1.2095v-1.4533q-1.1814 1.6127-2.9816 1.6127-2.0065 0-3.1785-1.6971-0.91887-1.3408-0.91887-3.3379 0-2.5035 1.2002-3.8255 1.2095-1.322 3.0004-1.322 1.8471 0 3.0473 1.6221v-1.3971h2.466v8.9355q0 1.7627-0.29067 2.6347-0.29066 0.87199-0.81573 1.3689t-1.4064 0.77823q-0.87199 0.28129-2.2128 0.28129-2.5316 0-3.5911-0.87199-1.0595-0.86261-1.0595-2.194 0-0.13127 9e-3 -0.31879zm2.3534-5.8414q0 1.5846 0.60946 2.3253 0.61883 0.73134 1.519 0.73134 0.96575 0 1.6315-0.7501 0.66571-0.75947 0.66571-2.2409 0-1.5471-0.63758-2.2972-0.63759-0.7501-1.6127-0.7501-0.947 0-1.5658 0.74072-0.60946 0.73135-0.60946 2.2409z' />
          <path d='m142.53 22.814v-2.4378h2.6347v2.4378zm0 11.308v-9.9575h2.6347v9.9575z' />
          <path d='m156.92 34.121h-2.6347v-5.0819q0-1.6127-0.16877-2.0815-0.16877-0.47819-0.55319-0.74072-0.37505-0.26253-0.9095-0.26253-0.68446 0-1.2283 0.37505t-0.7501 0.99388q-0.1969 0.61883-0.1969 2.2878v4.51h-2.6347v-9.9575h2.4472v1.4627q1.3033-1.6877 3.2817-1.6877 0.87199 0 1.594 0.31879 0.72197 0.30942 1.0876 0.79698 0.37505 0.48756 0.51569 1.1064 0.15002 0.61883 0.15002 1.7721z' />
          <path d='m166.79 34.121-3.1504-9.9575h2.5597l1.8659 6.5258 1.7158-6.5258h2.541l1.6596 6.5258 1.9034-6.5258h2.5972l-3.1973 9.9575h-2.5316l-1.7158-6.404-1.6877 6.404z' />
          <path d='m179.87 22.814v-2.4378h2.6347v2.4378zm0 11.308v-9.9575h2.6347v9.9575z' />
          <path d='m189.77 24.164v2.1003h-1.8002v4.013q0 1.2189 0.0469 1.4252 0.0563 0.1969 0.23441 0.32817 0.18752 0.13127 0.45006 0.13127 0.36567 0 1.0595-0.25316l0.22503 2.044q-0.91887 0.3938-2.0815 0.3938-0.71259 0-1.2845-0.2344-0.57195-0.24378-0.84386-0.61883-0.26254-0.38442-0.36568-1.0314-0.0844-0.45944-0.0844-1.8565v-4.3412h-1.2095v-2.1003h1.2095v-1.9784l2.6441-1.5377v3.5161z' />
          <path d='m194.22 20.376v5.0538q1.2752-1.4908 3.0473-1.4908 0.90949 0 1.6408 0.33754 0.73134 0.33754 1.097 0.86261 0.37505 0.52507 0.50632 1.1627 0.14064 0.63758 0.14064 1.9784v5.8414h-2.6347v-5.2601q0-1.5658-0.15001-1.9878-0.15002-0.42193-0.53445-0.66571-0.37505-0.25316-0.947-0.25316-0.65633 0-1.172 0.31879-0.51569 0.31879-0.75947 0.96575-0.2344 0.63758-0.2344 1.894v4.9881h-2.6347v-13.746z' />
          <path d='m208.46 24.164h2.4284v1.3596q1.3033-1.5846 3.1035-1.5846 0.95638 0 1.6596 0.3938 0.70322 0.3938 1.1533 1.1908 0.65633-0.79698 1.4158-1.1908 0.75947-0.3938 1.6221-0.3938 1.097 0 1.8565 0.45006 0.75947 0.44068 1.1345 1.3033 0.27191 0.63758 0.27191 2.0628v6.3665h-2.6347v-5.6914q0-1.4814-0.27191-1.9127-0.36567-0.56257-1.1252-0.56257-0.55319 0-1.0408 0.33754-0.48756 0.33754-0.70321 0.99388-0.21566 0.64696-0.21566 2.0534v4.7819h-2.6347v-5.457q0-1.4533-0.14065-1.8752-0.14064-0.42193-0.44068-0.62821-0.29066-0.20628-0.79698-0.20628-0.60945 0-1.097 0.32817-0.48756 0.32817-0.70321 0.947-0.20628 0.61883-0.20628 2.0534v4.8381h-2.6347z' />
          <path d='m224.49 24.164h2.8035l2.3816 7.0697 2.3253-7.0697h2.7285l-3.5161 9.5825-0.6282 1.7346q-0.34692 0.87199-0.66572 1.3314-0.30941 0.45944-0.72196 0.74072-0.40318 0.29066-1.0033 0.45006-0.5907 0.1594-1.3408 0.1594-0.75947 0-1.4908-0.1594l-0.2344-2.0628q0.61883 0.12189 1.1158 0.12189 0.91887 0 1.3596-0.54382 0.44068-0.53444 0.67509-1.3689z' />
          <path d='m250.56 29.068 2.691 0.85324q-0.61883 2.2503-2.0628 3.3473-1.4346 1.0876-3.6474 1.0876-2.7378 0-4.5006-1.8659-1.7627-1.8752-1.7627-5.1194 0-3.4317 1.7721-5.3257 1.7721-1.9034 4.66-1.9034 2.5222 0 4.0974 1.4908 0.93763 0.88136 1.4064 2.5316l-2.7472 0.65634q-0.24379-1.0689-1.022-1.6877-0.76885-0.61883-1.8752-0.61883-1.5283 0-2.4847 1.097-0.94699 1.097-0.94699 3.5536 0 2.6066 0.93762 3.713t2.4378 1.1064q1.1064 0 1.9034-0.70322 0.79698-0.70322 1.1439-2.2128z' />
          <path d='m257.59 27.202-2.3909-0.43131q0.40318-1.4439 1.3877-2.1378 0.98451-0.69384 2.9254-0.69384 1.7627 0 2.6254 0.42193 0.86261 0.41255 1.2095 1.0595 0.35629 0.63758 0.35629 2.3534l-0.0281 3.0754q0 1.3127 0.12189 1.9409 0.13126 0.61883 0.47818 1.3314h-2.6066q-0.10313-0.26253-0.25315-0.77823-0.0656-0.23441-0.0938-0.30942-0.67508 0.65634-1.4439 0.9845-0.76885 0.32817-1.6408 0.32817-1.5377 0-2.4284-0.83448-0.88137-0.83448-0.88137-2.1096 0-0.84386 0.40318-1.5002 0.40318-0.66571 1.1252-1.0126 0.73134-0.3563 2.1003-0.61883 1.8471-0.34692 2.5597-0.64696v-0.26253q0-0.75947-0.37505-1.0783-0.37505-0.32817-1.4158-0.32817-0.70322 0-1.097 0.28129-0.3938 0.27191-0.63758 0.96575zm3.5255 2.1378q-0.50632 0.16877-1.6033 0.40318-1.097 0.2344-1.4346 0.45944-0.51569 0.36567-0.51569 0.92825 0 0.5532 0.41255 0.95637 0.41256 0.40318 1.0501 0.40318 0.71259 0 1.3596-0.46881 0.47819-0.3563 0.62821-0.87199 0.10314-0.33754 0.10314-1.2845z' />
          <path d='m268.82 34.121h-2.6347v-9.9575h2.4472v1.4158q0.62821-1.0033 1.1252-1.322 0.50631-0.31879 1.1439-0.31879 0.90011 0 1.7346 0.49694l-0.81573 2.2972q-0.66572-0.43131-1.2377-0.43131-0.55319 0-0.93762 0.30942-0.38442 0.30004-0.60945 1.097-0.21566 0.79698-0.21566 3.3379z' />
          <path d='m279.54 30.952 2.6253 0.44068q-0.50632 1.4439-1.6033 2.2034-1.0876 0.7501-2.7285 0.7501-2.5972 0-3.8442-1.6971-0.9845-1.3596-0.9845-3.4317 0-2.4753 1.2939-3.8724 1.2939-1.4064 3.2723-1.4064 2.2222 0 3.5067 1.4721 1.2845 1.4627 1.2283 4.4912h-6.6009q0.0281 1.172 0.63759 1.8284 0.60945 0.64696 1.5189 0.64696 0.61883 0 1.0408-0.33754t0.63759-1.0876zm0.15002-2.6628q-0.0281-1.1439-0.59071-1.7346-0.56257-0.60008-1.3689-0.60008-0.86262 0-1.4252 0.62821-0.56257 0.62821-0.5532 1.7065z' />
          <path d='m289.72 34.121v-13.746h2.7754v13.746z' />
          <path d='m304.25 34.121h-2.4472v-1.4627q-0.60945 0.85324-1.4439 1.2752-0.8251 0.41255-1.669 0.41255-1.7158 0-2.9441-1.3783-1.2189-1.3877-1.2189-3.863 0-2.5316 1.1908-3.8442 1.1908-1.322 3.0098-1.322 1.669 0 2.8879 1.3877v-4.9506h2.6347zm-7.0322-5.1944q0 1.594 0.44068 2.3066 0.63758 1.0314 1.7815 1.0314 0.9095 0 1.5471-0.76885 0.63758-0.77823 0.63758-2.3159 0-1.7158-0.61883-2.4659-0.61883-0.75947-1.5846-0.75947-0.93762 0-1.5752 0.7501-0.62821 0.74072-0.62821 2.2222z' />
          <path d='m312.62 30.952 2.6253 0.44068q-0.50631 1.4439-1.6033 2.2034-1.0876 0.7501-2.7285 0.7501-2.5972 0-3.8442-1.6971-0.9845-1.3596-0.9845-3.4317 0-2.4753 1.2939-3.8724 1.2939-1.4064 3.2723-1.4064 2.2222 0 3.5067 1.4721 1.2845 1.4627 1.2283 4.4912h-6.6009q0.0281 1.172 0.63758 1.8284 0.60945 0.64696 1.519 0.64696 0.61883 0 1.0408-0.33754t0.63758-1.0876zm0.15002-2.6628q-0.0281-1.1439-0.5907-1.7346-0.56257-0.60008-1.3689-0.60008-0.86261 0-1.4252 0.62821-0.56258 0.62821-0.5532 1.7065z' />
          <path d='m326.59 34.121h-2.6347v-5.0819q0-1.6127-0.16877-2.0815-0.16877-0.47819-0.5532-0.74072-0.37505-0.26253-0.90949-0.26253-0.68446 0-1.2283 0.37505-0.54382 0.37505-0.75009 0.99388-0.1969 0.61883-0.1969 2.2878v4.51h-2.6347v-9.9575h2.4472v1.4627q1.3033-1.6877 3.2817-1.6877 0.87199 0 1.594 0.31879 0.72197 0.30942 1.0876 0.79698 0.37505 0.48756 0.51569 1.1064 0.15002 0.61883 0.15002 1.7721z' />
          <path d='m333.82 24.164v2.1003h-1.8002v4.013q0 1.2189 0.0469 1.4252 0.0563 0.1969 0.2344 0.32817 0.18753 0.13127 0.45006 0.13127 0.36567 0 1.0595-0.25316l0.22503 2.044q-0.91887 0.3938-2.0815 0.3938-0.71259 0-1.2845-0.2344-0.57195-0.24378-0.84386-0.61883-0.26253-0.38442-0.36567-1.0314-0.0844-0.45944-0.0844-1.8565v-4.3412h-1.2095v-2.1003h1.2095v-1.9784l2.6441-1.5377v3.5161z' />
          <path d='m335.65 22.814v-2.4378h2.6347v2.4378zm0 11.308v-9.9575h2.6347v9.9575z' />
          <path d='m345.55 24.164v2.1003h-1.8002v4.013q0 1.2189 0.0469 1.4252 0.0563 0.1969 0.23441 0.32817 0.18752 0.13127 0.45006 0.13127 0.36567 0 1.0595-0.25316l0.22503 2.044q-0.91887 0.3938-2.0815 0.3938-0.7126 0-1.2846-0.2344-0.57194-0.24378-0.84386-0.61883-0.26253-0.38442-0.36567-1.0314-0.0844-0.45944-0.0844-1.8565v-4.3412h-1.2095v-2.1003h1.2095v-1.9784l2.6441-1.5377v3.5161z' />
          <path d='m346.14 24.164h2.8035l2.3816 7.0697 2.3253-7.0697h2.7285l-3.5161 9.5825-0.62821 1.7346q-0.34692 0.87199-0.66571 1.3314-0.30941 0.45944-0.72197 0.74072-0.40317 0.29066-1.0032 0.45006-0.5907 0.1594-1.3408 0.1594-0.75948 0-1.4908-0.1594l-0.23441-2.0628q0.61883 0.12189 1.1158 0.12189 0.91887 0 1.3596-0.54382 0.44068-0.53444 0.67508-1.3689z' />
        </g>
      </svg>
    </Button>
  );
}
