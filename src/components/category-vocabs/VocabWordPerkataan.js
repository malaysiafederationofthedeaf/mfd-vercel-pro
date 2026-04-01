import React from "react";
import i18next from "i18next";

const VocabWordPerkataan = ({ word, perkataan, showTitleOnly = false }) => {

    const titleClassName = showTitleOnly ? "" : "vocab-word-perkataan-title"

    return (
        <div className="vocab-word-perkataan">
            <div className={titleClassName}>
                {i18next.language === "en" ? word : perkataan}
            </div>
            {!showTitleOnly &&
                <div className="vocab-word-perkataan-subtitle">
                    {i18next.language === "en" ? perkataan : word}
                </div>
            }
        </div>
    );
}

export default VocabWordPerkataan;
